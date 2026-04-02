from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView, CancelOrderView,
    AdminOrderListView, AdminOrderDetailView
)
from .razorpay_views import RazorpayCreateOrderView, RazorpayVerifyView

urlpatterns = [
    # User
    path('orders/', OrderListCreateView.as_view()),
    path('orders/<int:pk>/', OrderDetailView.as_view()),
    path('orders/<int:pk>/cancel/', CancelOrderView.as_view()),

    #razorpay
    path('razorpay/create-order/', RazorpayCreateOrderView.as_view()),
    path('razorpay/verify/', RazorpayVerifyView.as_view()),

    # Admin
    path('admin/orders/', AdminOrderListView.as_view()),
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view()),
]