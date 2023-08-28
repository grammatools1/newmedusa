"use client"

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Assuming Checkoutflow is located in the same directory as Checkout
const Checkoutflow = dynamic(
  () => import('app/checkout/Checkoutflow').then((mod) => mod.Checkoutflow),
  { ssr: false }
);

function Checkout() {
  const router = useRouter();

  // Assuming getCart is a function that retrieves the cart data
  const cart = getCart();

  return (
    <>
      {/* Use Suspense to wrap the Checkoutflow component */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* Render the dynamic Checkoutflow component */}
        <Checkoutflow cart={cart} />
      </Suspense>
    </>
  );
}

export default Checkout;
