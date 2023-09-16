import { createCart, getCart } from 'lib/medusa';
import { cookies } from 'next/headers';
import CheckoutFlow from './CheckoutFlow';


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
      <CheckoutFlow cart={cart} />
    </>
  );
}
