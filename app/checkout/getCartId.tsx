import React from 'react';
import { cookies } from 'next/headers';
import CheckoutFlow from './CheckoutFlow';

export default function GetcartId() {
  const cartId = cookies().get('cartId')?.value;

  return (
    <CheckoutFlow
      cartId={cartId || ''}
      onComplete={() => {
        alert("Checkout completed! Thank you for your order.");
      }}
      onCartUpdate={(cart) => {
        console.log("Cart updated:", cart);
      }}
    />
  );
}
