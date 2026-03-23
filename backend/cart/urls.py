from django.urls import path
from .views import CartView, ClearCartView

urlpatterns = [
    path('cart/', CartView.as_view()),
    path('cart/<int:pk>/', CartView.as_view()),
    path('cart/clear/', ClearCartView.as_view()),
]