from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Product, ProductImage
from wishlist.models import Wishlist


class WishlistApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="wishlist@example.com",
            password="secret123",
            name="Wishlist User",
        )
        self.product = Product.objects.create(
            slug="wishlist-phone",
            name="Wishlist Phone",
            brand="Echoo",
            category="Smartphone",
            price="999.00",
            stock=5,
            short_description="A phone for wishlist tests",
        )
        ProductImage.objects.create(product=self.product, image_url="https://example.com/image.jpg", is_primary=True)
        self.url = "/api/wishlist/"
        self.client.force_authenticate(self.user)

    def test_add_to_wishlist_returns_product_payload(self):
        response = self.client.post(self.url, {"product": self.product.id}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["product"]["id"], self.product.id)
        self.assertEqual(response.data["product_name"], self.product.name)

    def test_adding_duplicate_returns_existing_item(self):
        Wishlist.objects.create(user=self.user, product=self.product)

        response = self.client.post(self.url, {"product": self.product.id}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["product"]["id"], self.product.id)

    def test_delete_requires_existing_item(self):
        response = self.client.delete(self.url, {"product": self.product.id}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
