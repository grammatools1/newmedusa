import { createCart, getCart } from 'lib/medusa';
import { cookies } from 'next/headers';
import CartModal from './modal';
import DiscountCode from 'components/checkout/components/discount-code';


export default async function Cart() {
  const cartId = cookies().get('cartId')?.value;
   console.log(cartId);

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
      <CartModal cart={cart} />
      <DiscountCode cart={DiscountCode}/>
    </>
  );
}
