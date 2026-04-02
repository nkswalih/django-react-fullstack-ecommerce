import hashlib
import hmac
import logging

import razorpay
from django.conf import settings
from django.db import transaction
from django.db.models import F
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import CartItem
from products.models import Product, ProductImage
from django.db.models import Prefetch

from .models import Order, OrderItem
from .serializers import OrderSerializer

logger = logging.getLogger(__name__)

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class RazorpayCreateOrderView(APIView):
    """
    Step 1: Create a Razorpay order.
    Returns rzp order_id + amount to the frontend.
    Does NOT touch your DB yet — that happens only after payment verification.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_items = (
            CartItem.objects
            .filter(user=request.user)
            .select_related('product')
        )

        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate stock
        errors = []
        for item in cart_items:
            if item.product.stock < item.quantity:
                errors.append(
                    f'"{item.product.name}": only {item.product.stock} left'
                )
        if errors:
            return Response({'error': errors}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        shipping = 0 if subtotal > 50000 else 99
        total    = subtotal + shipping

        # Razorpay amount is always in paise (₹1 = 100 paise)
        amount_paise = int(total * 100)

        try:
            rzp_order = client.order.create({
                'amount':   amount_paise,
                'currency': 'INR',
                'payment_capture': 1,
                'notes': {
                    'user_id': str(request.user.id),
                    'user_email': request.user.email,
                }
            })
        except Exception:
            logger.exception("Razorpay order creation failed")
            return Response(
                {'error': 'Payment gateway error'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        return Response({
            'razorpay_order_id': rzp_order['id'],
            'amount':            amount_paise,
            'currency':          'INR',
            'key_id':            settings.RAZORPAY_KEY_ID,
        })


class RazorpayVerifyView(APIView):
    """
    Step 2: Verify payment signature from Razorpay, then create the DB order.
    This is the only place that creates an Order in your database.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        # All three fields must be present
        required = ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature']
        if any(field not in data for field in required):
            return Response(
                {'error': 'Missing payment fields'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── SIGNATURE VERIFICATION ──────────────────────────────────────────
        # Razorpay signs: "<order_id>|<payment_id>" with secret using HMAC-SHA256
        msg = f"{data['razorpay_order_id']}|{data['razorpay_payment_id']}"
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected, data['razorpay_signature']):
            logger.warning(
                "Signature mismatch for user %s order %s",
                request.user.id, data.get('razorpay_order_id')
            )
            return Response(
                {'error': 'Payment verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # ────────────────────────────────────────────────────────────────────

        # Shipping fields from frontend
        shipping_fields = [
            'first_name', 'last_name', 'email', 'phone',
            'address', 'city', 'state', 'pincode'
        ]
        if any(not data.get(f) for f in shipping_fields):
            return Response(
                {'error': 'Missing shipping details'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = self._create_order(request.user, data)
        except Exception:
            logger.exception("Order creation failed after payment for user %s", request.user.id)
            return Response(
                {'error': 'Order processing failed. Our team has been notified.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        order = Order.objects.select_related('user').prefetch_related('items').get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def _create_order(self, user, data):
        cart_items = (
            CartItem.objects
            .filter(user=user)
            .select_related('product')
            .prefetch_related(
                Prefetch(
                    'product__images',
                    queryset=ProductImage.objects.order_by('-is_primary', 'order', 'id')
                )
            )
            .select_for_update()
        )

        # Final stock check inside the transaction
        for item in cart_items:
            if item.product.stock < item.quantity:
                raise ValueError(f'"{item.product.name}" ran out of stock')

        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        shipping = 0 if subtotal > 50000 else 99
        total    = subtotal + shipping

        order = Order.objects.create(
            user=user,
            payment_method='razorpay',
            subtotal=subtotal,
            shipping=shipping,
            total=total,
            status='confirmed', 
            shipping_address={
                'first_name': data['first_name'],
                'last_name':  data['last_name'],
                'email':      data['email'],
                'phone':      data['phone'],
                'address':    data['address'],
                'city':       data['city'],
                'state':      data['state'],
                'pincode':    data['pincode'],
                'full_name':  f"{data['first_name']} {data['last_name']}",
                # Store Razorpay IDs for reconciliation
                'razorpay_payment_id': data['razorpay_payment_id'],
                'razorpay_order_id':   data['razorpay_order_id'],
            },
        )

        order_items = []
        product_qty = {}

        for item in cart_items:
            product = item.product
            images  = list(product.images.all())
            image   = images[0].image_url if images else ''

            order_items.append(OrderItem(
                order=order,
                product=product,
                product_name=product.name,
                product_image=image,
                product_brand=product.brand,
                product_slug=product.slug,
                storage=item.storage,
                ram=item.ram,
                quantity=item.quantity,
                unit_price=product.price,
                item_total=product.price * item.quantity,
            ))
            product_qty[product.id] = item.quantity

        OrderItem.objects.bulk_create(order_items)

        for product_id, qty in product_qty.items():
            Product.objects.filter(pk=product_id).update(stock=F('stock') - qty)

        cart_items.delete()
        return order