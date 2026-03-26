from rest_framework import serializers
from .models import Wishlist
from products.serializers import ProductSerializer


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id','product','product_name','product_image','product_price','added_at']

    def get_product_image(self,obj):
        img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return img.image_url if img else None
