import { cookies } from 'next/headers';
import CheckoutFlow from './CheckoutFlow';

export default async function GetcartId() {
  const cartId = cookies().get('cartId')?.value;
  console.log(cartId);
  return (
    <>
    <CheckoutFlow cartId={cartId || ''}
  onComplete={() => {
   alert("Checkout completed! Thank you for your order."); 
  }}
  onCartUpdate={(cart) => {
     console.log("Cart updated:", cart);
  }}
/>
    </>
  );
}
