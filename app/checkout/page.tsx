import { createCart, getCart } from 'lib/medusa';
import { cookies } from 'next/headers';
import CheckoutTemplate from "components/checkout/templates"
import { Metadata } from "next"
import CheckoutForm from "./checkout-form"
import CheckoutSummary from "./checkout-summary" 


export default async function Checkout() {
  const cartId = cookies().get('cartId')?.value;

  let cart;
  
  if (cartId) {
    cart = await getCart(cartId);
  }

  // If the `cartId` from the cookie is not set or the cart is empty
  // (old carts become `null` when you checkout), then get a new `cartId`
  //  and re-fetch the cart.
  if (!cartId || !cart) {
    cart = await createCart();
  }

  return (
    <> 
      <CheckoutForm cart={cart}/>
      <CheckoutSummary cart={cart}/>
      <CheckoutTemplate />
    </>
  );
}
