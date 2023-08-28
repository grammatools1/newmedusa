import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import useClient from '@data/use-client';
import { useRouter } from 'next/router';

const Checkoutflow = dynamic(
  () =>
    import('@components/checkout/Checkoutflow').then((mod) => mod.Checkoutflow),
  { ssr: false }
);

function Checkout() {
  const { getCart, isAuthenticated } = useClient();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/auth/login');
      }
    };
    handleAuth();
  }, []);

  const cart = getCart();

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
