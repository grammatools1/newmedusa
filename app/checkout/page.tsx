"use client"

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Medusa from '@medusajs/medusa-js';
import CheckoutFlow from './CheckoutFlow';

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [medusa, setMedusa] = useState<Medusa | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[] | null>(null);

  useEffect(() => {
    const initializeMedusa = async () => {
      const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
      if (!medusaBaseUrl) {
        console.error('Medusa base URL is not defined.');
        return;
      }

      const initializedMedusa = new Medusa({
        baseUrl: medusaBaseUrl,
        maxRetries: 3,
      });
      setMedusa(initializedMedusa);
    };

    initializeMedusa();
  }, []);

  useEffect(() => {
    if (cart) {
      fetchCartItems(cart);
    }
  }, [cart]);

  const fetchCartItems = async (cart: { id: string }) => {
    if (!medusa) {
      console.error('Medusa not initialized');
      return;
    }

    try {
      setLoading(true);
      const { cart: updatedCart } = await medusa.carts.retrieve(cart.id);
      setOrderTotal(updatedCart.total);
      setCartItems(updatedCart.items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to fetch cart items. Please refresh the page.', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />

      {loading && <div className="loader">Loading...</div>}

      {!loading && cart && orderTotal !== null && cartItems !== null && (
        <div className="checkout-container">
          <CheckoutFlow cart={cart} />
        </div>
      )}
    </>
  );
}

export default Checkout;
