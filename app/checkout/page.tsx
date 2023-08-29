"use client"

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckoutFlow } from './checkoutflow';

function Checkout() {
const [loading, setLoading] = useState(true);
const CheckoutFlow = dynamic(
  () => import('./checkoutflow').then((mod) => mod.CheckoutFlow),
  { ssr: false }
);
    
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
