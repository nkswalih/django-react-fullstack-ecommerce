from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "product_brand", "product_slug", "storage", "ram", "quantity", "unit_price", "item_total")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "payment_method", "total", "created_at")
    list_filter = ("status", "payment_method", "created_at", "updated_at")
    search_fields = ("id", "user__email", "user__name")
    readonly_fields = ("created_at", "updated_at", "cancelled_at")
    autocomplete_fields = ("user",)
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name", "quantity", "unit_price", "item_total")
    search_fields = ("order__id", "product_name", "product_brand", "product_slug")
    autocomplete_fields = ("order", "product")
