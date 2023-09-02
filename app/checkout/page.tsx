import React, { useState, useEffect } from 'react';
import { ToastContainer, toast  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import Medusa from '@medusajs/medusa-js';
import CheckoutFlow from './CheckoutFlow';

function Checkout() {
  const [cart, setCart] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [medusa, setMedusa] = useState<Medusa | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const initializeMedusa = async () => {
      const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;

      if (!medusaBaseUrl) {
        console.error('Medusa base URL is not defined.');
        return;
      }

      try {
        const initializedMedusa = new Medusa({
          baseUrl: medusaBaseUrl,
          maxRetries: 3,
        });
        console.log('Initialized Medusa:', initializedMedusa);
        setMedusa(initializedMedusa);
      } catch (error) {
        console.error('Error initializing Medusa:', error);
      }
    };

    initializeMedusa();
  }, []);

  useEffect(() => {
    if (cart) {
      fetchCartItems(cart);
    }
  }, [cart, medusa]);

  const fetchCartItems = async (cartId: string) => {
    console.log('cartId:', cartId);
    
    if (!medusa) {
      console.error('Medusa not initialized');
      return;
    }

    try {
      setLoading(true);
      const { cart: updatedCart } = await medusa.carts.retrieve(cartId);
      
      if (!updatedCart) {
        console.error('Cart data is undefined or null');
        return;
      }

      setOrderTotal(updatedCart.total);
      console.log('orderTotal:', updatedCart.total);
      setCartItems(updatedCart.items);
      console.log('cartItems:', updatedCart.items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to fetch cart items. Please refresh the page.', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCartUpdate = (cart: { id: string }) => {
    console.log('Updated cart:', cart);
    setCart(cart.id);
  };

  return (
    <>
      <ToastContainer position="top-right" />

      {loading && <div className="loader">Loading...</div>}

      {!loading && cart && orderTotal !== null && cartItems !== null && (
        <div className="checkout-container">
          <CheckoutFlow cartId={cart} onCartUpdate={handleCartUpdate} />
        </div>
      )}
    </>
  );
}

export default Checkout;
