import React from 'react';
import { cookies } from 'next/headers';
import CheckoutFlow from './CheckoutFlow';
import { getCart } from 'lib/medusa';

export default async function GetcartId() {
  const cartId = cookies().get('cartId')?.value;
  console.log(cartId);

 let cart;

  if (cartId) {
    cart = await getCart(cartId);
  }

  return (
    <CheckoutFlow
      cart={cart}
      onComplete={() => {
        alert("Checkout completed! Thank you for your order.");
      }}
      onCartUpdate={(cart) => {
        console.log("Cart updated:", cart);
      }}
    />
  );
}
