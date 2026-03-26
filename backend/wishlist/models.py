from django.db import models
from users.models import User
from products.models import Product

# Create your models here.
class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user','product']
    
    def __str__(self):
        return f"{self.user.name} ❤️ {self.product.name}"