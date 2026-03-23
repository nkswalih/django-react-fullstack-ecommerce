from django.db import models
from users.models import User
from products.models import Product

class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    storage = models.CharField(max_length=50, blank=True)
    ram = models.CharField(max_length=50, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product', 'storage', 'ram']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"