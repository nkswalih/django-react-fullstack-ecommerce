import logging
from datetime import timedelta

from django.db import IntegrityError, transaction
from django.db.models import Avg, CharField, F, Q, Sum
from django.db.models.functions import Cast
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import CreateOrderSerializer, OrderSerializer

logger = logging.getLogger(__name__)

def is_admin(user):
    return bool(user.is_authenticated and user.role == 'Admin')


def parse_positive_int(value, default):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return max(parsed, 0)


def build_order_summary(queryset):
    stats = queryset.aggregate(
        total_revenue=Sum('total'),
        average_order_value=Avg('total'),
    )

    return {
        'total_orders': queryset.count(),
        'total_revenue': stats['total_revenue'] or 0,
        'pending_orders': queryset.filter(status='pending').count(),
        'completed_orders': queryset.filter(status='completed').count(),
        'average_order_value': round(stats['average_order_value'] or 0),
    }


class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            orders = (
                Order.objects
                .filter(user=request.user)
                .select_related('user')
                .prefetch_related('items__product')
                .order_by('-created_at')
            )
            return Response(OrderSerializer(orders, many=True).data)
        except Exception:
            logger.exception(f"Failed to fetch orders for user {request.user.id}")
            return Response(
                {'error': 'Failed to fetch orders'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        order = Order.objects.select_related('user').prefetch_related('items').get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            queryset = (
                Order.objects.select_related('user').prefetch_related('items__product')
            )
            if is_admin(request.user):
                order = get_object_or_404(queryset, pk=pk)
            else:
                order = get_object_or_404(queryset, pk=pk, user=request.user)
            
            return Response(OrderSerializer(order).data)
        except Exception:
            logger.exception(f"Failed to etch order {pk} or user {request.user.id}")
            return Response(
                {'error':'Failed to fetch order'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            order = get_object_or_404(
                Order.objects.prefetch_related('items__product'),
                pk=pk,
                user=request.user
            )
        except Exception:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if order.status not in ['pending', 'confirmed']:
            return Response(
                {'error': f'Cannot cancel order with status "{order.status}"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                for item in order.items.all():
                    if item.product_id:
                        from products.models import Product
                        Product.objects.filter(pk=item.product_id).update(
                            stock=F('stock') + item.quantity
                        )

                order.status       = 'cancelled'
                order.cancelled_at = timezone.now()
                order.save(update_fields=['status', 'cancelled_at'])

            return Response(OrderSerializer(order).data)

        except IntegrityError:
            logger.exception(f"IntegrityError cancelling order {pk}")
            return Response(
                {'error': 'Database error while cancelling'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception:
            logger.exception(f"Failed to cancel order {pk} for user {request.user.id}")
            return Response(
                {'error': 'Failed to cancel order'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        try:
            params = request.GET
            orders = (
                Order.objects.all()
                .select_related('user')
                .prefetch_related('items__product')
                .order_by('-created_at')
            )
            summary = build_order_summary(orders)

            if q := params.get('q'):
                orders = orders.annotate(id_str=Cast('id', output_field=CharField())).filter(
                    Q(id_str__icontains=q) |
                    Q(user__name__icontains=q) |
                    Q(user__email__icontains=q) |
                    Q(shipping_address__full_name__icontains=q)
                )

            status_filter = params.get('status')
            if status_filter and status_filter.lower() != 'all':
                orders = orders.filter(status=status_filter)

            payment_method = params.get('payment_method')
            if payment_method and payment_method.lower() != 'all':
                orders = orders.filter(payment_method=payment_method)

            date_filter = params.get('date_filter')
            if date_filter and date_filter.lower() != 'all':
                now = timezone.now()

                if date_filter == 'today':
                    orders = orders.filter(created_at__date=now.date())
                elif date_filter == 'this-week':
                    start_of_week = now - timedelta(days=now.weekday())
                    orders = orders.filter(created_at__date__gte=start_of_week.date())
                elif date_filter == 'this-month':
                    orders = orders.filter(created_at__year=now.year, created_at__month=now.month)

            sort_map = {
                'oldest': 'created_at',
                'total-high': '-total',
                'total-low': 'total',
                'newest': '-created_at',
            }
            orders = orders.order_by(sort_map.get(params.get('sort'), '-created_at'))

            if 'limit' in params or 'offset' in params:
                total = orders.count()
                limit = parse_positive_int(params.get('limit'), 10)
                offset = parse_positive_int(params.get('offset'), 0)
                paginated_orders = orders[offset:offset + limit] if limit > 0 else orders.none()

                return Response({
                    'results': OrderSerializer(paginated_orders, many=True).data,
                    'total': total,
                    'limit': limit,
                    'offset': offset,
                    'summary': summary,
                })

            return Response(OrderSerializer(orders, many=True).data)

        except Exception:
            logger.exception("Admin failed to fetch orders")
            return Response(
                {'error': 'Failed to fetch orders'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)

        order = get_object_or_404(
            Order.objects.prefetch_related('items__product'),
            pk=pk
        )

        new_status    = request.data.get('status')
        valid_statuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']

        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Choose from: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                if new_status == 'cancelled' and not order.cancelled_at:
                    # ✅ Restore stock using F() — atomic, no Python race condition
                    for item in order.items.all():
                        if item.product_id:
                            from products.models import Product
                            Product.objects.filter(pk=item.product_id).update(
                                stock=F('stock') + item.quantity
                            )
                    order.cancelled_at = timezone.now()

                order.status = new_status
                order.save(update_fields=['status', 'cancelled_at'])

            return Response(OrderSerializer(order).data)

        except IntegrityError:
            logger.exception(f"IntegrityError updating order {pk} status")
            return Response(
                {'error': 'Database error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception:
            logger.exception(f"Admin failed to update order {pk}")
            return Response(
                {'error': 'Failed to update order'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
