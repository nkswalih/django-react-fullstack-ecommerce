from django.contrib import admin

from .models import CartItem


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "quantity", "storage", "ram", "added_at")
    list_filter = ("added_at",)
    search_fields = ("user__email", "user__name", "product__name", "product__slug")
    autocomplete_fields = ("user", "product")
    readonly_fields = ("added_at",)
