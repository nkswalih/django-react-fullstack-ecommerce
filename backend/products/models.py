from django.db import models


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    slug = models.SlugField(max_length=255,unique=True)
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100)
    category = models.CharField(max_length=100)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="INR")

    stock = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default="active")

    short_description = models.TextField()

    features = models.JSONField(default=list, blank=True)
    specs = models.JSONField(default=dict, blank=True)
    variants = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    image_url = models.TextField()

    order=models.PositiveIntegerField(default=0)
    is_primary=models.BooleanField(default=False)

    def __str__(self):
        return f"{self.product.name} Image"
