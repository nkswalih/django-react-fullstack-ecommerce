import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from products.models import Product, ProductImage


class Command(BaseCommand):
    help = "Seed products from the legacy frontend db.json file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--source",
            default=None,
            help="Optional path to a JSON file containing a top-level products array.",
        )
        parser.add_argument(
            "--replace",
            action="store_true",
            help="Delete existing products before importing.",
        )

    def handle(self, *args, **options):
        source = options["source"]
        if source:
            source_path = Path(source)
        else:
            source_path = Path(__file__).resolve().parents[4] / "frontend" / "src" / "data" / "db.json"

        if not source_path.exists():
            raise CommandError(f"Source file not found: {source_path}")

        with source_path.open(encoding="utf-8") as file:
            payload = json.load(file)

        products = payload.get("products", [])
        if not isinstance(products, list) or not products:
            raise CommandError("No products array found in the source JSON.")

        with transaction.atomic():
            if options["replace"]:
                Product.objects.all().delete()

            imported = 0
            for item in products:
                slug = item.get("slug") or slugify(item.get("name") or item.get("id") or f"product-{imported + 1}")
                status = str(item.get("status") or "active").strip().lower()
                if status in {"new", "out-of-stock", "coming-soon"}:
                    status = "active"

                product, _ = Product.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "name": item.get("name", "").strip() or slug.replace("-", " ").title(),
                        "brand": item.get("brand", "").strip() or "Unknown",
                        "category": item.get("category", "").strip() or "General",
                        "price": item.get("price", 0) or 0,
                        "currency": item.get("currency", "INR"),
                        "stock": item.get("stock", 0) or 0,
                        "short_description": item.get("shortDescription", item.get("short_description", "")),
                        "features": item.get("features", []),
                        "specs": item.get("specs", {}),
                        "variants": item.get("variants", {}),
                        "status": status,
                    },
                )

                ProductImage.objects.filter(product=product).delete()
                for index, image in enumerate(item.get("images", [])):
                    image_url = image.get("image_url") if isinstance(image, dict) else image
                    if not image_url:
                        continue
                    ProductImage.objects.create(
                        product=product,
                        image_url=str(image_url).strip(),
                        order=index,
                        is_primary=(index == 0),
                    )

                imported += 1

        self.stdout.write(self.style.SUCCESS(f"Imported {imported} products from {source_path}"))
