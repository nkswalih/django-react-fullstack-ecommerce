from django.db.models import Prefetch
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product, ProductImage

from .models import CartItem
from .serializers import CartItemSerializer


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, user):
        return CartItem.objects.filter(user=user).select_related('user', 'product').prefetch_related(
            Prefetch('product__images', queryset=ProductImage.objects.order_by('-is_primary', 'order', 'id'))
        )

    def get(self, request):
        items = self.get_queryset(request.user)
        return Response(CartItemSerializer(items, many=True).data)

    def post(self, request):
        product_id = request.data.get('product_id') or request.data.get('productId')
        quantity = max(int(request.data.get('quantity', 1)), 1)
        storage = request.data.get('storage', '')
        ram = request.data.get('ram', '')

        try:
            product = Product.objects.get(pk=product_id, status='active')
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if quantity > product.stock:
            return Response({'error': 'Requested quantity exceeds stock'}, status=status.HTTP_400_BAD_REQUEST)

        item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            storage=storage,
            ram=ram,
            defaults={'quantity': quantity},
        )

        if not created:
            item.quantity = min(item.quantity + quantity, product.stock)
            item.save(update_fields=['quantity'])

        item = self.get_queryset(request.user).get(pk=item.pk)
        return Response(
            CartItemSerializer(item).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        try:
            item = CartItem.objects.select_related('product').get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')
        if quantity is None:
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)

        quantity = max(int(quantity), 1)
        if quantity > item.product.stock:
            return Response({'error': 'Requested quantity exceeds stock'}, status=status.HTTP_400_BAD_REQUEST)

        item.quantity = quantity
        item.save(update_fields=['quantity'])
        item = self.get_queryset(request.user).get(pk=item.pk)
        return Response(CartItemSerializer(item).data)

    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
