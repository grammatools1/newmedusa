"use client"
import {  CartProvider } from "medusa-react"
import DiscountCode from "components/checkout/components/discount-code"
import GiftCard from "components/checkout/components/gift-card"
import PaymentButton from "components/checkout/components/payment-button"
import CartTotals from "components/checkout/common/components/cart-totals"
import { useCart } from "medusa-react"

const CheckoutSummary = () => {
  const { cart } = useCart()
 console.log(cart?.id);
  if (!cart?.id) {
    return null
  }

  return (
   
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8">
      <div className="w-full bg-white p-6 flex flex-col gap-y-6">
        <CartTotals cart={cart} />
            console.log(<CartTotals cart={cart} />);
        <PaymentButton paymentSession={cart?.payment_session} />
      </div>
      <div className="p-6 bg-white">
        <CartProvider>
        <DiscountCode cart={cart} />   
        </CartProvider>
      </div>
      <GiftCard cart={cart} />
    </div>

  )
}

export default CheckoutSummary
