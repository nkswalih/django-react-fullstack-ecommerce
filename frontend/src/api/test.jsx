import { useState,useEffect } from "react";
import { getProducts } from "./apiService";

function TestApi(){
    const [products, setProducts] = useState([])

    useEffect(() => {
        getProducts()
            .then(res => {
                console.log(res.data);
                setProducts(res.data);
            })
            .catch(err => console.error(err))
   },[])
   return <div>{products.length} Products</div>
}

export default TestApi