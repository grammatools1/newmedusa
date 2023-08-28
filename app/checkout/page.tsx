"use client"

import React, { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const Checkoutflow = dynamic(
  () =>
    import('@components/checkout/Checkoutflow').then((mod) => mod.Checkoutflow),
  { ssr: false }
);

import { client } from '@data/client';

function Checkout() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      if (!client.isAuthenticated()) {
        router.push('/auth/login');
      }
    };
    handleAuth();
  }, []);

  const cart = client.getCart();

  return (
    <>
      {/* Use Suspense to wrap the Checkoutflow component */}
      <Suspense fallback={<div>Loading...</div>}>
        <Checkoutflow cart={cart} />
      </Suspense>
    </>
  );
}

export default Checkout;
