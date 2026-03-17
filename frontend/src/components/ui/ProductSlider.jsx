import React from 'react';

const products = [
    { id: 1, name: 'MacBook Air', price: 'From ₹99900.00', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=500' },
    { id: 2, name: 'iPhone 15 Pro', price: 'From ₹134900.00', image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=500' },
    { id: 3, name: 'Apple Watch', price: 'From ₹41900.00', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=500' },
    { id: 4, name: 'iPad Pro', price: 'From ₹81900.00', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=500' },
    { id: 5, name: 'AirPods Pro', price: '₹24900.00', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=500' },
    { id: 6, name: 'HomePod', price: '₹29900.00', image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&q=80&w=500' },
];

const ProductSlider = () => {
    return (
        <section className="container-custom py-10">
            <h2 className="text-[28px] mb-6 text-text-main font-semibold">
                The latest. <span className="text-text-secondary">Take a look at what’s new.</span>
            </h2>

            <div className="no-scrollbar flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory px-1">
                {products.map((product) => (
                    <div key={product.id} className="aesthetic-card min-w-[320px] h-[400px] p-[30px] flex flex-col justify-between snap-start bg-cover bg-center relative overflow-hidden" style={{
                        backgroundImage: `url(${product.image})`,
                    }}>
                        {/* Overlay for text readability */}
                        <div className="absolute inset-x-0 top-0 h-[150px] from-white/90 to-transparent z-10" />

                        <div className="relative z-20">
                            <h3 className="text-2xl mb-1 font-semibold">{product.name}</h3>
                            <p className="text-sm text-text-main">{product.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProductSlider;
