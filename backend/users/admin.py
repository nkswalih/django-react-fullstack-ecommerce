from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("-created_at",)
    list_display = ("email", "name", "role", "status", "is_staff", "created_at")
    list_filter = ("role", "status", "is_staff", "is_superuser", "is_active", "created_at")
    search_fields = ("email", "name")
    readonly_fields = ("created_at", "updated_at", "last_login")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "avatar", "google_id")}),
        ("Access", {"fields": ("role", "status", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "password1", "password2", "role", "status", "is_active", "is_staff"),
            },
        ),
    )

    filter_horizontal = ("groups", "user_permissions")
