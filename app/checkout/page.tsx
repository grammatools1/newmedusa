"use client"

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CheckoutFlow = dynamic(() => import('./CheckoutFlow'), { ssr: false });

function Checkout({ cartId }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      const response = await fetch(`/api/cart/${cartId}`); // Use the appropriate API endpoint
      const data = await response.json();
      setCart(data);
      setLoading(false);
    }

    fetchCart();
  }, [cartId]);

  return (
    <>
      <ToastContainer position="top-right" />

      {loading && <div className="loader">Loading...</div>}

      {!loading && cart && (
        <div className="checkout-container">
          <CheckoutFlow cart={cart} />
        </div>
      )}
    </>
  );
}

export default Checkout;

