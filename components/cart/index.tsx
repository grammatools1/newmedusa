import { createCart, getCart } from 'lib/medusa';
import { cookies } from 'next/headers';
import CartModal from './modal';
import CheckoutFlow from 'app/checkout/CheckoutFlow';

export default async function Cart() {
  const cartId = cookies().get('cartId')?.value;
   console.log(cartId);
  let cart;

  if (cartId) {
    cart = await getCart(cartId);
  }

  // If the `cartId` from the cookie is not set or the cart is empty
  // (old carts becomes `null` when you checkout), then get a new `cartId`
  //  and re-fetch the cart.
  if (!cartId || !cart) {
    cart = await createCart();
  }
   onComplete=() => {
        alert("Checkout completed! Thank you for your order.");
      };
  onCartUpdate=() => {
        console.log("Cart updated:", cart);
      };
  
  return (
    <>
      <CheckoutFlow cart={cart} onComplete={cart} onCartUpdate={cart}/>
      <CartModal cart={cart} /> 
    </>
  );
}
