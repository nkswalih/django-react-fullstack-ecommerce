from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product
from .serializers import ProductSerializer


def is_admin(user):
    return user.is_authenticated and user.role == "Admin"


class ProductListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Product.objects.prefetch_related("images").order_by("-created_at")

        if not is_admin(request.user):
            qs = qs.exclude(status__iexact="inactive")

        if category := request.GET.get("category"):
            if category.lower() != "all":
                qs = qs.filter(category__iexact=category)

        if brand := request.GET.get("brand"):
            if brand.lower() != "all":
                qs = qs.filter(brand__iexact=brand)

        if is_admin(request.user):
            if s := request.GET.get("status"):
                qs = qs.filter(status__iexact=s)

        if q := request.GET.get("q"):
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(brand__icontains=q)
                | Q(category__icontains=q)
                | Q(short_description__icontains=q)
            )

        return Response(ProductSerializer(qs, many=True).data)

    def post(self, request):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


#  Product Detail / Update / Delete 
class ProductDetailsView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, slug, public_only=False):
        qs = Product.objects.prefetch_related("images")
        if public_only:
            qs = qs.exclude(status__iexact="inactive")
        return get_object_or_404(qs, slug=slug)

    def get(self, request, slug):
        product = self.get_object(slug, public_only=not is_admin(request.user))
        return Response(ProductSerializer(product).data)

    def put(self, request, slug):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        product = self.get_object(slug)
        serializer = ProductSerializer(product, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, slug):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        product = self.get_object(slug)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, slug):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        product = self.get_object(slug)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)