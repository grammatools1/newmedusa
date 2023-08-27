import { createCart, getCart } from 'lib/medusa';
import { cookies } from 'next/headers';
import CartModal from './modal';
import CheckoutFlow from './checkoutflow';

export default function Cart() {
  const cartId = cookies().get('cartId')?.value;
  let cart;

  if (cartId) {
    cart = getCart(cartId);
  }

  // If the `cartId` from the cookie is not set or the cart is empty
  // (old carts becomes `null` when you checkout), then get a new `cartId`
  // and re-fetch the cart.
  if (!cartId || !cart) {
    cart = createCart();
    document.cookie = `cartId=${cart.id}; path=/`;
    localStorage.setItem('cart_id', cart.id);
  }

  return (
    <>
      <CartModal cart={cart} />
      <CheckoutFlow cart={cart} />
    </>
  );
}
