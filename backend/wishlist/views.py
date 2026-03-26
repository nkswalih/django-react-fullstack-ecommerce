from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Wishlist
from .serializers import WishlistSerializer
from products.models import Product

# Create your views here.
class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Wishlist.objects.filter(user=request.user).select_related('product').prefetch_related('product__images')
        return Response(WishlistSerializer(items, many=True).data)
    
    def post(self, request):
        product_id = request.data.get('product')
        if not product_id:
            return Response({"detail": "Product is required."}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product.objects.prefetch_related("images"), pk=product_id)

        item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )

        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(WishlistSerializer(item).data, status=response_status)
    
    def delete(self, request):
        product_id = request.data.get("product")
        if not product_id:
            return Response({"detail": "Product is required."}, status=status.HTTP_400_BAD_REQUEST)

        deleted_count, _ = Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
        if not deleted_count:
            return Response({"detail": "Wishlist item not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message":"Removed from Wishlist"})
