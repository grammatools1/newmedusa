"use client"

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';


const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;

const CheckoutFlow = dynamic(() => import('./CheckoutFlow'), { ssr: false });
 
function Checkout() {
const [loading, setLoading] = useState(true);
const [cart, setCart] = useState(null);
 
  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      const response = await fetch('medusaBaseUrl/store/carts/'); // Replace with your API endpoint
      const data = await response.json();
      setCart(data);
      setLoading(false);
    }

    fetchCart();
  }, []);
  
  return (
    <>
      <ToastContainer position="top-right" />

      {loading && <div className="loader">Loading...</div>}

      {!loading && cart && (
        <div className="checkout-container">
         <CheckoutFlow cart={cart} />;
        </div>
      )}
    </>
  );
}
     
export default Checkout;
