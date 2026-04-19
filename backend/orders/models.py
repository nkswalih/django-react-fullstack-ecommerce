from django.db import models
from users.models import User
from products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped',   'Shipped'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_CHOICES = [
        ('card', 'Card'),
        ('upi',  'UPI'),
        ('cod',  'Cash on Delivery'),
        ('razorpay', 'Razorpay'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    shipping = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    # Shipping address snapshot — stored as JSON so it's preserved even if user changes address
    shipping_address = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"ORD-{self.id} | {self.user.email} | {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)

    product_name = models.CharField(max_length=500)
    product_image = models.URLField(max_length=500)
    product_brand = models.CharField(max_length=200)
    product_slug = models.CharField(max_length=500)

    storage = models.CharField(max_length=100, blank=True)
    ram = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    item_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"