from django.urls import path
from .views import ProductListCreateView,ProductDetailsView, ProductBulkCreate


urlpatterns = [
    path('products/', ProductListCreateView.as_view()),
    path('products/<slug:slug>/', ProductDetailsView.as_view()),
    path('products/bulk/', ProductBulkCreate.as_view())
]
