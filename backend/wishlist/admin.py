from django.contrib import admin

from .models import Wishlist


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "added_at")
    list_filter = ("added_at",)
    search_fields = ("user__email", "user__name", "product__name", "product__slug")
    autocomplete_fields = ("user", "product")
    readonly_fields = ("added_at",)
