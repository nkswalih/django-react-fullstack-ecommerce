from django.urls import path
from .views import ProductListCreateView,ProductDetailsView


urlpatterns = [
    path('products/', ProductListCreateView.as_view()),
    path('products/<slug:slug>/', ProductDetailsView.as_view()),
]
