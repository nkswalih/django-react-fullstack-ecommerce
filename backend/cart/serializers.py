from rest_framework import serializers

from .models import CartItem


class CartUserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    name = serializers.CharField(read_only=True)


class CartItemSerializer(serializers.ModelSerializer):
    user = CartUserSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    productName = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    productImage = serializers.SerializerMethodField()
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    productPrice = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_brand = serializers.CharField(source='product.brand', read_only=True)
    productBrand = serializers.CharField(source='product.brand', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    productSlug = serializers.CharField(source='product.slug', read_only=True)
    productId = serializers.IntegerField(source='product.id', read_only=True)
    addedAt = serializers.DateTimeField(source='added_at', read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id',
            'user',
            'product',
            'productId',
            'product_name',
            'productName',
            'product_image',
            'productImage',
            'product_price',
            'productPrice',
            'product_brand',
            'productBrand',
            'product_slug',
            'productSlug',
            'storage',
            'ram',
            'quantity',
            'added_at',
            'addedAt',
        ]
        read_only_fields = ['id', 'added_at', 'addedAt', 'user']

    def _get_primary_image(self, obj):
        images = sorted(obj.product.images.all(), key=lambda image: (not image.is_primary, image.order, image.id))
        return images[0].image_url if images else None

    def get_product_image(self, obj):
        return self._get_primary_image(obj)

    def get_productImage(self, obj):
        return self._get_primary_image(obj)
