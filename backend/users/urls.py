from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view()),
    path("login/", views.LoginView.as_view()),
    path("logout/", views.LogoutView.as_view()),
    path("token/refresh/", views.TokenRefreshView.as_view()),
    path("auth/google/", views.GoogleLoginView.as_view()),
    path("profile/", views.ProfileView.as_view()),
    path("admin/users/", views.AdminUserListView.as_view()),
    path("admin/users/<int:pk>/", views.AdminUserDetailView.as_view()),
    path("forgot-password/", views.ForgetPasswordView.as_view()),
    path("reset-password/", views.ResetPasswordView.as_view()),
]