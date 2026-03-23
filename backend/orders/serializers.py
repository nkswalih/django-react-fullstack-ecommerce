from django.db import transaction
from django.db.models import F, Prefetch
from rest_framework import serializers

from cart.models import CartItem
from products.models import ProductImage

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    productId = serializers.IntegerField(source='product.id', read_only=True)
    productName = serializers.CharField(source='product_name', read_only=True)
    productImage = serializers.CharField(source='product_image', read_only=True)
    productBrand = serializers.CharField(source='product_brand', read_only=True)
    productSlug = serializers.CharField(source='product_slug', read_only=True)
    unitPrice = serializers.DecimalField(source='unit_price', max_digits=10, decimal_places=2, read_only=True)
    itemTotal = serializers.DecimalField(source='item_total', max_digits=12, decimal_places=2, read_only=True)
    productPrice = serializers.DecimalField(source='unit_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'productId',
            'product_name',
            'productName',
            'product_image',
            'productImage',
            'product_brand',
            'productBrand',
            'product_slug',
            'productSlug',
            'storage',
            'ram',
            'quantity',
            'unit_price',
            'unitPrice',
            'productPrice',
            'item_total',
            'itemTotal',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    userName = serializers.CharField(source='user.name', read_only=True)
    userEmail = serializers.CharField(source='user.email', read_only=True)
    shippingAddress = serializers.JSONField(source='shipping_address', read_only=True)
    paymentMethod = serializers.CharField(source='payment_method', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    cancelledAt = serializers.DateTimeField(source='cancelled_at', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'userName',
            'userEmail',
            'status',
            'payment_method',
            'paymentMethod',
            'subtotal',
            'shipping',
            'total',
            'shipping_address',
            'shippingAddress',
            'items',
            'created_at',
            'createdAt',
            'updated_at',
            'updatedAt',
            'cancelled_at',
            'cancelledAt',
        ]


class CreateOrderSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=['card', 'upi', 'cod'])
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    pincode = serializers.CharField()

    def validate(self, data):
        user = self.context['request'].user
        cart_items = CartItem.objects.select_related('product').prefetch_related(
            Prefetch('product__images', queryset=ProductImage.objects.order_by('-is_primary', 'order', 'id'))
        ).filter(user=user)

        if not cart_items.exists():
            raise serializers.ValidationError("Cart is empty")

        for item in cart_items:
            if item.product.stock < item.quantity:
                raise serializers.ValidationError(f'{item.product.name} is out of stock')

        data['cart_items'] = cart_items
        return data

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user

        cart_items = CartItem.objects.select_related('product').prefetch_related(
            Prefetch('product__images', queryset=ProductImage.objects.order_by('-is_primary', 'order', 'id'))
        ).select_for_update().filter(user=user)

        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        shipping = 0 if subtotal > 50000 else 99
        total = subtotal + shipping

        order = Order.objects.create(
            user=user,
            payment_method=validated_data['payment_method'],
            subtotal=subtotal,
            shipping=shipping,
            total=total,
            shipping_address={
                'first_name': validated_data['first_name'],
                'last_name': validated_data['last_name'],
                'email': validated_data['email'],
                'phone': validated_data['phone'],
                'address': validated_data['address'],
                'city': validated_data['city'],
                'state': validated_data['state'],
                'pincode': validated_data['pincode'],
                'full_name': f"{validated_data['first_name']} {validated_data['last_name']}",
            },
        )

        order_items = []
        for item in cart_items:
            product = item.product
            images = list(product.images.all())
            primary_image = images[0].image_url if images else ''

            order_items.append(
                OrderItem(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_image=primary_image,
                    product_brand=product.brand,
                    product_slug=product.slug,
                    storage=item.storage,
                    ram=item.ram,
                    quantity=item.quantity,
                    unit_price=product.price,
                    item_total=product.price * item.quantity,
                )
            )

        OrderItem.objects.bulk_create(order_items)

        for item in cart_items:
            type(item.product).objects.filter(id=item.product.id).update(stock=F('stock') - item.quantity)

        cart_items.delete()
        return order
