import React, { useEffect, useState } from 'react';
import { productOperations, cartOperations } from '../services/ecommerceService';
import { Product, CartItem } from '../services/ecommerceService';

const EcommerceView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 'demo-user'; // Replace with actual user ID from auth context

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prod, cartItems] = await Promise.all([
          productOperations.getAll(),
          cartOperations.getItems(userId)
        ]);
        setProducts(prod);
        setCart(cartItems);
      } catch (e) {
        console.error('Error loading ecommerce data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = async (productId: string) => {
    try {
      await cartOperations.addItem(userId, productId, 1);
      const updatedCart = await cartOperations.getItems(userId);
      setCart(updatedCart);
    } catch (e) {
      console.error('Error adding to cart', e);
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      await cartOperations.removeItem(itemId);
      const updatedCart = await cartOperations.getItems(userId);
      setCart(updatedCart);
    } catch (e) {
      console.error('Error removing from cart', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter italic">Online Store</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-200">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded" />
            )}
            <h3 className="mt-2 font-bold text-lg text-slate-800">{product.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{product.description}</p>
            <p className="mt-2 text-xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</p>
            <button
              onClick={() => handleAddToCart(product.id)}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-[20px] font-black text-xs uppercase tracking-widest"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <h3 className="text-2xl font-bold mt-8">Shopping Cart</h3>
      {cart.length === 0 ? (
        <p className="text-slate-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => {
            const product = products.find(p => p.id === item.product_id);
            return (
              <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-[16px] border border-slate-200">
                <div className="flex items-center gap-4">
                  {product?.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-medium text-slate-800">{product?.name || 'Product'}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-slate-900">₹{(product?.price || 0) * item.quantity}</p>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EcommerceView;