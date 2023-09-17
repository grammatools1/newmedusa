"use client"
import { CartProvider } from "medusa-react"
import Addresses from "components/checkout/components/addresses"
import Payment from "components/checkout/components/payment"
import Shipping from "components/checkout/components/shipping"
import { useCart } from "medusa-react"

const CheckoutForm = () => {
  const { cart } = useCart()
      console.log(cart);

  if (!cart?.id) {
    console.log(cart);
    return null
  }

  return (
    
    <div>
      <div className="w-full grid grid-cols-1 gap-y-8">
        <div>
          <Addresses />
        </div>

        <div>
          <CartProvider>
          <Shipping cart={cart} />
            console.log(cart);
          </CartProvider>
        </div>

        <div>
          <Payment />
        </div>
      </div>
    </div>

  )
}

export default CheckoutForm
