from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra):
        if not email:
            raise ValueError("Email required")
        if not name:
            raise ValueError("Name required")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, name, password):
        user = self.create_user(email, name, password, role='Admin', status='Active')
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
    

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [('User', 'User'), ('Admin', 'Admin')]
    STATUS_CHOICES = [('Active', 'Active'), ('Inactive', 'Inactive')]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='User')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    avatar = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    objects = UserManager()


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email
