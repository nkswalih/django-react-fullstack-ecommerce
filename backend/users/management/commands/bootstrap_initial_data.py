from pathlib import Path
from tempfile import NamedTemporaryFile

from django.conf import settings
from django.core.management import BaseCommand, CommandError, call_command
from django.db import connections

from cart.models import CartItem
from orders.models import Order
from products.models import Product
from users.models import User
from wishlist.models import Wishlist


APP_LABELS = ["users", "products", "orders", "cart", "wishlist"]
SQLITE_ALIAS = "sqlite_import"


class Command(BaseCommand):
    help = (
        "Load first-run application data from sqlite_data.json or db.sqlite3 "
        "only when the main PostgreSQL database is still empty."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Run the bootstrap import even if application rows already exist.",
        )
        parser.add_argument(
            "--fixture",
            default=settings.BOOTSTRAP_FIXTURE_PATH,
            help="Path to a JSON fixture file to load first.",
        )
        parser.add_argument(
            "--sqlite-path",
            default=settings.SQLITE_IMPORT_PATH,
            help="Fallback SQLite database path to import from.",
        )

    def handle(self, *args, **options):
        if not options["force"] and self._application_data_exists():
            self.stdout.write(
                self.style.NOTICE(
                    "Application data already exists in PostgreSQL. Skipping bootstrap."
                )
            )
            return

        fixture_path = Path(options["fixture"]).resolve()
        if fixture_path.is_file():
            self.stdout.write(f"Loading initial data from fixture: {fixture_path}")
            call_command("loaddata", str(fixture_path), verbosity=1)
            return

        sqlite_path = Path(options["sqlite_path"]).resolve()
        if sqlite_path.is_file():
            self._load_from_sqlite(sqlite_path)
            return

        self.stdout.write(
            self.style.WARNING(
                "No bootstrap data source found. Skipping initial data import."
            )
        )

    def _application_data_exists(self):
        models = (User, Product, Order, CartItem, Wishlist)
        return any(model.objects.exists() for model in models)

    def _load_from_sqlite(self, sqlite_path: Path):
        self.stdout.write(
            f"Fixture not found. Importing initial data from SQLite: {sqlite_path}"
        )
        connections.databases[SQLITE_ALIAS] = {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": str(sqlite_path),
        }

        with NamedTemporaryFile(
            mode="w+",
            suffix=".json",
            delete=False,
            encoding="utf-8",
        ) as tmp_file:
            tmp_path = Path(tmp_file.name)

        try:
            call_command(
                "dumpdata",
                *APP_LABELS,
                database=SQLITE_ALIAS,
                output=str(tmp_path),
                indent=2,
                verbosity=0,
            )
            if tmp_path.stat().st_size == 0:
                raise CommandError(
                    f"No data was exported from SQLite database {sqlite_path}."
                )
            call_command("loaddata", str(tmp_path), verbosity=1)
        finally:
            if SQLITE_ALIAS in connections:
                connections[SQLITE_ALIAS].close()
            tmp_path.unlink(missing_ok=True)
