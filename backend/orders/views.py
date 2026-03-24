import logging

from django.db import IntegrityError, transaction
from django.db.models import F
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
            status_filter = request.GET.get('status')
            orders = (
                Order.objects.all()
                .select_related('user')
                .prefetch_related('items__product')
                .order_by('-created_at')
            )
            if status_filter:
                orders = orders.filter(status=status_filter)

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