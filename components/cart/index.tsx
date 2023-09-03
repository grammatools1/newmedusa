import { createCart, getCart } from 'lib/medusa';
import { cookies } from 'next/headers';
import CartModal from './modal';
import CheckoutFlow from 'app/checkout/CheckoutFlow';


interface Props {
  cartId: string | null;
  onComplete: () => void;
  onCartUpdate: CartUpdateFunction;
}

export default async function Cart() {
  const cartId = cookies().get('cartId')?.value;
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
  const handleComplete = () => {
    // do something when the checkout is complete
  };

  const handleCartUpdate = (updatedCart: Cart) => {
    // do something when the cart is updated
  };
  return (
    <>
      <CartModal cart={cart} />
       <CheckoutFlow cartId={cartId || ''} onComplete={onComplete} onCartUpdate={onCartUpdate} />
    </>
  );
}
