from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product
from .serializers import ProductSerializer


def is_admin(user):
    return user.is_authenticated and user.role == "Admin"


def normalize_key(value):
    return "".join(ch for ch in str(value or "").lower() if ch.isalnum())


CATEGORY_ALIASES = {
    "smartphone": {"smartphone", "smartphones", "phone", "phones", "mobile", "mobiles"},
    "laptop": {"laptop", "laptops", "macbook", "notebook", "notebooks"},
    "audio": {"audio", "earbud", "earbuds", "headphone", "headphones", "speaker", "speakers"},
    "accessory": {"accessory", "accessories", "accesssoires", "gadget", "gadgets"},
    "tablet": {"tablet", "tablets", "ipad", "ipads"},
    "watch": {"watch", "watches", "smartwatch", "smartwatches"},
}

CATEGORY_LABELS = {
    "smartphone": "Smartphone",
    "laptop": "Laptop",
    "audio": "Audio",
    "accessory": "Accessory",
    "tablet": "Tablet",
    "watch": "Watch",
}


def resolve_category_key(value):
    normalized = normalize_key(value)

    for category_key, aliases in CATEGORY_ALIASES.items():
        if normalized in {normalize_key(alias) for alias in aliases}:
            return category_key

    return normalized


def build_category_filter(category):
    category_key = resolve_category_key(category)
    aliases = CATEGORY_ALIASES.get(category_key)

    if not aliases:
        return Q(category__iexact=category)

    query = Q()
    for alias in aliases:
        query |= Q(category__iexact=alias)
    return query


def build_category_counts(queryset):
    counts = {}

    for row in queryset.values("category").annotate(count=Count("id")):
        category_key = resolve_category_key(row["category"])
        category_name = CATEGORY_LABELS.get(category_key, row["category"])

        if category_key not in counts:
            counts[category_key] = {
                "id": category_key,
                "name": category_name,
                "count": 0,
            }

        counts[category_key]["count"] += row["count"]

    return sorted(counts.values(), key=lambda item: item["name"].lower())


def build_product_summary(queryset):
    products = list(queryset.only("id", "price", "stock"))

    return {
        "total_products": len(products),
        "out_of_stock": sum(1 for product in products if product.stock == 0),
        "low_stock": sum(1 for product in products if 0 < product.stock < 10),
        "total_value": sum(product.price * product.stock for product in products),
        "categories": build_category_counts(queryset),
    }


def parse_positive_int(value, default):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return max(parsed, 0)


class ProductListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Product.objects.prefetch_related("images")

        # visibility
        if not is_admin(request.user):
            qs = qs.exclude(status__iexact="inactive")

        params = request.GET
        summary = build_product_summary(qs)
        filtered_qs = qs

        # search
        if q := params.get("q"):
            filtered_qs = filtered_qs.filter(
                Q(name__icontains=q) |
                Q(brand__icontains=q) |
                Q(category__icontains=q) |
                Q(short_description__icontains=q)
            )

        if brand := params.get("brand"):
            if brand.lower() != "all":
                filtered_qs = filtered_qs.filter(brand__iexact=brand)

        category_counts = build_category_counts(filtered_qs)
        qs = filtered_qs

        # filters
        if category := params.get("category"):
            if category.lower() != "all":
                qs = qs.filter(build_category_filter(category))

        if status := params.get("status"):
            if status.lower() != "all":
                qs = qs.filter(status__iexact=status)

        sort_map = {
            "price_low": "price",
            "price_high": "-price",
            "newest": "-created_at",
        }
        qs = qs.order_by(sort_map.get(params.get("sort"), "-created_at"))

        total = qs.count()
        total_available = filtered_qs.count()

        if "limit" in params or "offset" in params:
            limit = parse_positive_int(params.get("limit"), 12)
            offset = parse_positive_int(params.get("offset"), 0)
            qs = qs[offset:offset + limit] if limit > 0 else qs.none()

        return Response({
            "results": ProductSerializer(qs, many=True).data,
            "total": total,
            "total_available": total_available,
            "category_counts": category_counts,
            "summary": summary,
        })

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
