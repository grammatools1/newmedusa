"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { cookies } from 'next/headers';
import { getCart } from '../lib/medusa';
import CheckoutFlow from './CheckoutFlow';
import CartModal from 'components/cart/CartModal';

function Checkout() {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);

      // Get the cart ID from cookies
      const cartId = cookies(document.cookie).get('cartId')?.value;

      // If no cart ID is found, set `loading` state to `false`
      if (!cartId) {
        setLoading(false);
        return;
      }

      try {
        // Retrieve the cart using the `getCart` function
        const retrievedCart = await getCart(cartId);
        setCart(retrievedCart);
        setLoading(false);
      } catch (error) {
        console.log('Error retrieving cart:', error);
      }
    };

    fetchCart();
  }, []);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <>
      <CartModal cart={cart} />
      <CheckoutFlow cart={cart} />
    </>
  );
}

export default Checkout;
