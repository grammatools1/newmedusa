import { createCart, getCart } from 'lib/medusa';
import { cookies } from 'next/headers';
import CartModal from './modal';
import CheckoutFlow from './CheckoutFlow';

export default function Cart() {
  const cartId = cookies().get('cartId')?.value;
  let cart;

  if (cartId) {
    cart = await getCart(cartId);
  }

  // If the `cartId` from the cookie is not set or the cart is empty
  // (old carts becomes `null` when you checkout), then get a new `cartId`
  // and re-fetch the cart.
  if (!cartId || !cart) {
    cart = await createCart();
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
