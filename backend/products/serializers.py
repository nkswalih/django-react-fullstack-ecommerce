from rest_framework import serializers

from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image_url", "order", "is_primary"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    shortDescription = serializers.CharField(source="short_description", required=False)
    primaryImage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "slug",
            "name",
            "brand",
            "category",
            "price",
            "currency",
            "stock",
            "status",
            "short_description",
            "shortDescription",
            "features",
            "specs",
            "variants",
            "images",
            "primaryImage",
            "created_at",
            "updated_at",
        ]

    def _extract_image_urls(self):
        raw_images = self.initial_data.get("images", [])
        image_urls = []

        if not isinstance(raw_images, list):
            return image_urls

        for image in raw_images:
            if isinstance(image, dict):
                image = image.get("image_url") or image.get("url")
            if image and str(image).strip():
                image_urls.append(str(image).strip())

        return image_urls

    def _sync_images(self, product, image_urls):
        if image_urls is None:
            return

        ProductImage.objects.filter(product=product).delete()
        for index, image_url in enumerate(image_urls):
            ProductImage.objects.create(
                product=product,
                image_url=image_url,
                order=index,
                is_primary=(index == 0),
            )

    def create(self, validated_data):
        image_urls = self._extract_image_urls()
        product = Product.objects.create(**validated_data)
        self._sync_images(product, image_urls)
        return product

    def update(self, instance, validated_data):
        image_urls = self._extract_image_urls() if "images" in self.initial_data else None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        self._sync_images(instance, image_urls)
        return instance

    def get_primaryImage(self, obj):
        primary = next((image for image in obj.images.all() if image.is_primary), None)
        if primary:
            return primary.image_url
        first_image = next(iter(obj.images.all()), None)
        return first_image.image_url if first_image else None
