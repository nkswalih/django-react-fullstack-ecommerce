from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, ProductImage
from .serializers import ProductSerializer


def is_admin(user):
    return bool(user.is_authenticated and user.role == "Admin")


def public_products(queryset):
    return queryset.exclude(status__iexact="inactive")


class ProductListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.prefetch_related("images").order_by("-created_at")

        if not is_admin(request.user):
            products = public_products(products)

        category = request.GET.get("category")
        if category and category.lower() != "all":
            products = products.filter(category__iexact=category)

        brand = request.GET.get("brand")
        if brand and brand.lower() != "all":
            products = products.filter(brand__iexact=brand)

        status_filter = request.GET.get("status")
        if status_filter and is_admin(request.user):
            products = products.filter(status__iexact=status_filter)

        query = request.GET.get("q")
        if query:
            products = products.filter(
                Q(name__icontains=query)
                | Q(brand__icontains=query)
                | Q(category__icontains=query)
                | Q(short_description__icontains=query)
            )

        return Response(ProductSerializer(products, many=True).data)

    def post(self, request):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


class ProductDetailsView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, request, slug):
        queryset = Product.objects.prefetch_related("images")
        if request.method == "GET" and not is_admin(request.user):
            queryset = public_products(queryset)
        return get_object_or_404(queryset, slug=slug)

    def get(self, request, slug):
        product = self.get_object(request, slug)
        return Response(ProductSerializer(product).data)

    def put(self, request, slug):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        product = self.get_object(request, slug)
        serializer = ProductSerializer(product, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, slug):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        product = self.get_object(request, slug)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, slug):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        product = self.get_object(request, slug)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductBulkCreate(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        data = request.data.get("products", [])
        created_products = []

        for item in data:
            product, _ = Product.objects.update_or_create(
                slug=item.get("slug") or item["id"],
                defaults={
                    "name": item["name"],
                    "brand": item["brand"],
                    "category": item["category"],
                    "price": item["price"],
                    "currency": item.get("currency", "INR"),
                    "stock": item.get("stock", 0),
                    "short_description": item.get("shortDescription", item.get("short_description", "")),
                    "features": item.get("features", []),
                    "specs": item.get("specs", {}),
                    "variants": item.get("variants", {}),
                    "status": item.get("status", "active"),
                },
            )

            ProductImage.objects.filter(product=product).delete()
            for index, image_url in enumerate(item.get("images", [])):
                if isinstance(image_url, dict):
                    image_url = image_url.get("image_url", "")
                if not image_url or not str(image_url).strip():
                    continue
                ProductImage.objects.create(
                    product=product,
                    image_url=image_url,
                    order=index,
                    is_primary=(index == 0),
                )

            created_products.append(product.slug)

        return Response(
            {
                "message": "Products created",
                "count": len(created_products),
                "products": created_products,
            },
            status=status.HTTP_201_CREATED,
        )
