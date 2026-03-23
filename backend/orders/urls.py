from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView, CancelOrderView,
    AdminOrderListView, AdminOrderDetailView
)

urlpatterns = [
    # User
    path('orders/',                    OrderListCreateView.as_view()),
    path('orders/<int:pk>/',           OrderDetailView.as_view()),
    path('orders/<int:pk>/cancel/',    CancelOrderView.as_view()),

    # Admin
    path('admin/orders/',              AdminOrderListView.as_view()),
    path('admin/orders/<int:pk>/',     AdminOrderDetailView.as_view()),
]