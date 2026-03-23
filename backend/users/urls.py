from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileView, AdminUserListView, AdminUserDetailView


urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('admin/users/', AdminUserListView.as_view()),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view()),
]
