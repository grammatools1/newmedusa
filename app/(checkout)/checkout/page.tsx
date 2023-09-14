import { CartProvider } from 'medusa-react';
import CheckoutTemplate from "components/checkout/templates"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
}

export default function Checkout() {
  
  return 
    <CartProvider>
    <CheckoutTemplate />
    </CartProvider>
}
