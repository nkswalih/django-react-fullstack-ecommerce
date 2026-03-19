from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product,ProductImage
from .serializers import ProductSerializer
from django.shortcuts import get_object_or_404

# Create your views here.
class ProductListCreateView(APIView):
    
    def get(self, request):
        products = Product.objects.all()

        category = request.GET.get("category")
        if category:
            products = products.filter(category=category)

        brand = request.GET.get("brand")
        if brand:
            products = products.filter(brand=brand)

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ProductDetailsView(APIView):
    def get(self, request, slug):
        try:
           product = get_object_or_404(Product, slug=slug)
        except Product.DoesNotExist:
           return Response({"errors": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    def put(self,request,slug):
        product = get_object_or_404(Product, slug=slug)
        serializer = ProductSerializer(product, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, slug):
        product = get_object_or_404(Product, slug=slug)
        serializer = ProductSerializer(product, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,slug):
        product = get_object_or_404(Product, slug=slug)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductBulkCreate(APIView):

    def post(self,request):
        data = request.data.get("products",[])

        created_products = []

        for item in data:
            product = Product.objects.create(
                slug=item["id"],
                name=item["name"],
                brand=item["brand"],
                category=item["category"],
                price=item["price"],
                currency=item.get("currency","INR"),
                stock=item["stock"],
                short_description=item.get("shortDescription",""),
                features=item.get("features",[]),
                specs=item.get("specs",{}),
                variants=item.get("variants",{}),
                status=item.get("status","active"),
            )

            for index,img in enumerate(item.get("images",[])):
                if img.strip() != "":
                    ProductImage.objects.create(
                        product=product,
                        image_url=img,
                        order=index,
                        is_primary=(index == 0)
                    )

            created_products.append(product.slug)

        return Response({
            "message": "Products created",
            "count": len(created_products)
        }, status=status.HTTP_201_CREATED)