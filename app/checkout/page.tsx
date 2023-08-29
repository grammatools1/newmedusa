"use client"

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Checkoutflow from './Checkoutflow';

const Checkout = () => {
  const router = useRouter();

  const cart = getCart();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Checkoutflow cart={cart} />
      </Suspense>
    </>
  );
}

export default Checkout;
