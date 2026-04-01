from django.contrib import admin

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ("image_url", "order", "is_primary")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "brand", "category", "price", "stock", "status", "updated_at")
    list_filter = ("brand", "category", "status", "created_at", "updated_at")
    search_fields = ("name", "slug", "brand", "category")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "order", "is_primary")
    list_filter = ("is_primary",)
    search_fields = ("product__name", "product__slug", "image_url")
    autocomplete_fields = ("product",)
