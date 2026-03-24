import statistics
import time
from decimal import Decimal

from django.core.management.base import BaseCommand
from rest_framework.test import APIClient

from products.models import Product, ProductImage
from users.models import User


class Command(BaseCommand):
    help = "Run a repeatable smoke/load test across register, login, cart, and order flows."

    def add_arguments(self, parser):
        parser.add_argument("--users", type=int, default=50, help="Number of users to simulate.")
        parser.add_argument(
            "--keep-data",
            action="store_true",
            help="Keep generated users and the temporary load-test product after the run.",
        )

    def handle(self, *args, **options):
        user_count = max(1, options["users"])
        keep_data = options["keep_data"]
        timestamp = int(time.time())
        email_prefix = f"loadtest-{timestamp}"

        product, created = Product.objects.get_or_create(
            slug=f"{email_prefix}-product",
            defaults={
                "name": "Load Test Product",
                "brand": "Echoo",
                "category": "Smartphone",
                "price": Decimal("999.00"),
                "currency": "INR",
                "stock": max(1000, user_count * 2),
                "short_description": "Temporary product used for automated smoke/load testing.",
                "features": ["Load test safe"],
                "specs": {"suite": "load-test"},
                "variants": {"colors": ["black"]},
                "status": "active",
            },
        )
        if created:
            ProductImage.objects.create(
                product=product,
                image_url="https://via.placeholder.com/300x300?text=Load+Test+Product",
                order=0,
                is_primary=True,
            )
        elif product.stock < user_count:
            product.stock = max(1000, user_count * 2)
            product.status = "active"
            product.save(update_fields=["stock", "status", "updated_at"])

        timings = {"register": [], "login": [], "products": [], "cart_add": [], "cart_get": [], "order_create": [], "orders_get": []}
        failures = []
        created_emails = []
        overall_start = time.perf_counter()

        for index in range(user_count):
            user_number = index + 1
            email = f"{email_prefix}-{user_number}@example.com"
            password = "LoadTest123"
            name = f"Load Test {user_number}"
            client = APIClient()

            try:
                start = time.perf_counter()
                register_response = client.post(
                    "/api/register/",
                    {"email": email, "name": name, "password": password},
                    format="json",
                )
                timings["register"].append(time.perf_counter() - start)
                if register_response.status_code != 201:
                    raise ValueError(f"register failed with {register_response.status_code}: {register_response.data}")
                created_emails.append(email)

                start = time.perf_counter()
                login_response = client.post(
                    "/api/login/",
                    {"email": email, "password": password},
                    format="json",
                )
                timings["login"].append(time.perf_counter() - start)
                if login_response.status_code != 200:
                    raise ValueError(f"login failed with {login_response.status_code}: {login_response.data}")

                access_token = login_response.data["tokens"]["access"]
                client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

                start = time.perf_counter()
                products_response = client.get("/api/products/")
                timings["products"].append(time.perf_counter() - start)
                if products_response.status_code != 200:
                    raise ValueError(f"products failed with {products_response.status_code}: {products_response.data}")

                start = time.perf_counter()
                cart_add_response = client.post(
                    "/api/cart/",
                    {"product_id": product.id, "quantity": 1},
                    format="json",
                )
                timings["cart_add"].append(time.perf_counter() - start)
                if cart_add_response.status_code not in {200, 201}:
                    raise ValueError(f"cart add failed with {cart_add_response.status_code}: {cart_add_response.data}")

                start = time.perf_counter()
                cart_get_response = client.get("/api/cart/")
                timings["cart_get"].append(time.perf_counter() - start)
                if cart_get_response.status_code != 200 or len(cart_get_response.data) != 1:
                    raise ValueError(f"cart get failed with {cart_get_response.status_code}: {cart_get_response.data}")

                start = time.perf_counter()
                order_response = client.post(
                    "/api/orders/",
                    {
                        "payment_method": "cod",
                        "first_name": "Load",
                        "last_name": f"User {user_number}",
                        "email": email,
                        "phone": "9999999999",
                        "address": "Load Test Street",
                        "city": "Calicut",
                        "state": "Kerala",
                        "pincode": "673001",
                    },
                    format="json",
                )
                timings["order_create"].append(time.perf_counter() - start)
                if order_response.status_code != 201:
                    raise ValueError(f"order create failed with {order_response.status_code}: {order_response.data}")

                start = time.perf_counter()
                orders_response = client.get("/api/orders/")
                timings["orders_get"].append(time.perf_counter() - start)
                if orders_response.status_code != 200 or len(orders_response.data) != 1:
                    raise ValueError(f"orders get failed with {orders_response.status_code}: {orders_response.data}")

            except Exception as error:
                failures.append({"user": email, "error": str(error)})

        total_duration = time.perf_counter() - overall_start
        success_count = user_count - len(failures)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Load test completed: {success_count}/{user_count} users passed"))
        self.stdout.write(f"Total duration: {total_duration:.2f}s")
        self.stdout.write(f"Average per user: {(total_duration / user_count):.3f}s")

        for label, values in timings.items():
            if not values:
                continue
            avg_ms = statistics.mean(values) * 1000
            max_ms = max(values) * 1000
            self.stdout.write(f"{label}: avg {avg_ms:.1f}ms | max {max_ms:.1f}ms | samples {len(values)}")

        if failures:
            self.stdout.write("")
            self.stdout.write(self.style.ERROR("Failures detected:"))
            for failure in failures[:10]:
                self.stdout.write(f"- {failure['user']}: {failure['error']}")
            if len(failures) > 10:
                self.stdout.write(f"... and {len(failures) - 10} more")

        if not keep_data:
            User.objects.filter(email__startswith=email_prefix).delete()
            product.delete()
            self.stdout.write("")
            self.stdout.write("Temporary load-test data cleaned up.")
        else:
            self.stdout.write("")
            self.stdout.write("Generated test data was kept because --keep-data was used.")
