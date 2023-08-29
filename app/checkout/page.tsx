"use client"

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Checkoutflow from './checkoutflow';

const Checkout = () => {
  const router = useRouter();
  
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CheckoutFlow cart={cart} />
      </Suspense>
    </>
  );
}

export default Checkout;
