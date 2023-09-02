"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Medusa from '@medusajs/medusa-js';
import ShippingForm from './ShippingForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const PaymentMethod = {
  credit_card: {
    card_number: '',
    exp_month: '',
    exp_year: '',
    cvv: '',
  },
  paypal: {
    email: '',
  },
  crypto: {
    wallet_address: '',
  },
};

type PaymentMethodKey = keyof typeof PaymentMethod;

interface Props {
  cart: any;
}

  function CheckoutFlow(props: Props) {
  const { cart } = props;
  const [medusa, setMedusa] = useState<Medusa | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<keyof typeof PaymentMethod>("credit_card");
  const [couponCode, setCouponCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
 /* const [orderTotal, setOrderTotal] = useState(cart.total);
  const [cartItems, setCartItems] = useState(cart.items);*/
  const [orderTotal, setOrderTotal] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(1);
  const [confirmOrder, setConfirmOrder] = useState(false);

useEffect(() => {
  const initializeMedusa = async () => {
    const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
    if (!medusaBaseUrl) {
      console.error('Medusa base URL is not defined.');
      return;
    }

    const initializedMedusa = new Medusa({
      baseUrl: medusaBaseUrl,
      maxRetries: 3,
    });
    console.log('Initialized Medusa:', initializedMedusa);
    setMedusa(initializedMedusa);
  };

  initializeMedusa();
}, []);
    

  /*useEffect(() => {
    const initializeMedusa = async () => {
      const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
      if (!medusaBaseUrl) {
        console.error('Medusa base URL is not defined.');
        return;
      }

      const initializedMedusa = new Medusa({
        baseUrl: medusaBaseUrl,
        maxRetries: 3,
      });
      setMedusa(initializedMedusa);
    };

    initializeMedusa();
  }, []); */

    
   
  useEffect(() => {
    fetchCartItems(cart);
  }, [cart]);


 export const fetchCartItems = async (cart: { id: string }) => {
  console.log('cart:', cart);
  if (!medusa) {
    console.error('Medusa not initialized');
   return 
   /*<div>Loading...</div>;*/
  }

  try {
    setLoading(true);
    const { cart: updatedCart } = await medusa.carts.retrieve(cart.id);
    console.log('updatedCart:', updatedCart);
    setOrderTotal(updatedCart.total);
    console.log('orderTotal:', updatedCart.total);
    setCartItems(updatedCart.items);
    console.log('cartItems:', updatedCart.items);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    toast.error('Failed to fetch cart items. Please refresh the page.', { autoClose: 3000 });
  } finally {
    setLoading(false);
  }
};

  const handleShippingComplete = () => {
    setStep(2);
  };

  const handlePaymentComplete = () => {
    setStep(3);
  };

 const handlePlaceOrder = async () => {
  if (!medusa) return;

  try {
    setLoading(true);
    const paymentData = {
      provider_id: selectedPaymentMethod,
      data: {
        ...PaymentMethod[selectedPaymentMethod],
      },
    };

    await medusa.carts.setPaymentSession(cart.id, paymentData);
    const { type, data } = await medusa.carts.complete(cart.id);
    console.log('Checkout Completed:', type, data);
    toast.success('Your order has been successfully placed!', { autoClose: 3000 });
    setConfirmOrder(false);
    // TODO: Display order confirmation or handle any further actions
  } catch (error) {
    console.error('Error completing checkout:', error);
    toast.error('Failed to place order. Please try again or contact support.', { autoClose: 3000 });
  } finally {
    setLoading(false);
  }
};
   
 const handleApplyCoupon = async () => {
  if (!medusa || !cart || !couponCode) return;

  try {
    let cartData = cart;
    const { cart: updatedCartData } = await medusa.carts.update(cartData.id, {
      discounts: [{ code: couponCode }],
    });
    setOrderTotal(updatedCartData.total);
    setCouponCode("");

    toast.success("Coupon applied!", { autoClose: 3000 });
  } catch (error) {
    console.error("Error applying coupon:", error);
    toast.error("Failed to apply coupon. Please try again or contact support.", { autoClose: 3000 });
  }
};



   
  const handleApplyGiftCard = useCallback(async () => {
    if (!medusa || !giftCardCode) {
      return;
    }

   try {
  const { cart: updatedCart } = await medusa.carts.update(cart.id, {
    gift_cards: [{ code: giftCardCode }],
  });
  setOrderTotal(updatedCart.total);

  toast.success("Gift card applied!", { autoClose: 3000 });
} catch (error) {
  console.error("Error applying gift card:", error);
  toast.error("Failed to apply gift card. Please try again or contact support.", { autoClose: 3000 });
} 
}, [cart, giftCardCode, medusa]);

  const validateForm = (formValues: any) => {
    const errors: any = {};

    // Add validation checks here for each form value

    return errors;
  };

  const handleGoBack = () => {
    setStep(step - 1);
  };

  const handleNextStep = useCallback(() => {
    const errors = validateForm({});

    if (Object.keys(errors).length === 0) {
      setStep(step + 1);
    } else {
      // Show form errors to the user
    }
  }, [step, validateForm]);

  const handleConfirmOrder = () => {
    setConfirmOrder(true);
  };

  const handleCancelOrder = () => {
    setConfirmOrder(false);
  };

  const handleCreditCardChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
  const { name, value } = e.currentTarget;
  setSelectedPaymentMethod('credit_card');
}, []);

  const handlePaypalChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setSelectedPaymentMethod('paypal');
  }, []);

  const handleCryptoChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setSelectedPaymentMethod('crypto');
  }, []);

  const memoizedHandleApplyCoupon = useMemo(() => handleApplyCoupon, [handleApplyCoupon]);
  const memoizedHandleApplyGiftCard = useMemo(() => handleApplyGiftCard, [handleApplyGiftCard]);

  return (
    <>
      <ToastContainer position="top-right" />

      {loading && <div className="loader">Loading...</div>}

      {!loading && (
        <div className="checkout-flow">
          {step === 1 && (
            <div>
              {/* Step 1: Cart Review */}
              <h1>Step 1: Cart Review</h1>
              {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                <>
                  <ul>
                    {cartItems.map((item: any) => (
                      <li key={item.id}>
                        {item.quantity} x {item.product.title} - ${item.total.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <div className="coupon-gift">
                    <div>
                      <label htmlFor="coupon">Coupon Code:</label>
                      <input
                        id="coupon"
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button onClick={memoizedHandleApplyCoupon}>Apply Coupon</button>
                    </div>
                    <div>
                      <label htmlFor="gift-card">Gift Card Code:</label>
                      <input
                        id="gift-card"
                        type="text"
                        placeholder="Enter gift card code"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value)}
                      />
                      <button onClick={memoizedHandleApplyGiftCard}>Apply Gift Card</button>
                    </div>
                  </div>
                  <p className="order-total">Order Total: ${orderTotal.toFixed(2)}</p>
                  <ShippingForm cart={cart} onComplete={handleShippingComplete} />
                </>
              )}
            </div>
          )}
          {step === 2 && (
            <div>
              {/* Step 2: Shipping Information */}
              <h1>Step 2: Shipping Information</h1>
              <button onClick={handleGoBack}>Go back</button>
              <ShippingForm cart={cart} onComplete={handleNextStep} />
            </div>
          )}
          {step === 3 && (
            <div>
              {/* Step 3: Payment Method Selection */}
              <h1>Step 3: Payment Method Selection</h1>
              <button onClick={handleGoBack}>Go back</button>
              <div className="payment-methods">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={selectedPaymentMethod === 'credit_card'}
                    onChange={handleCreditCardChange}
                  />
                  Credit Card
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={selectedPaymentMethod === 'paypal'}
                    onChange={handlePaypalChange}
                  />
                  PayPal
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="crypto"
                    checked={selectedPaymentMethod === 'crypto'}
                    onChange={handleCryptoChange}
                  />
                  Crypto
                </label>
              </div>
              <button onClick={handlePaymentComplete}>Proceed to Order Review</button>
            </div>
          )}
          {step === 4 && (
            <div>
              {/* Step 4: Order Review */}
              <h1>Step 4: Order Review</h1>
              <button onClick={handleGoBack}>Go back</button>
              <div className="order-summary">
                {/* Display order summary */}
                <p>Selected Payment Method: {selectedPaymentMethod}</p>
                {/* Display other order details like shipping method, total price, etc. */}
              </div>
              <div>
                {confirmOrder ? (
                  <>
                    <p>Please review your order and click "Place Order" to confirm.</p>
                    <button onClick={handleCancelOrder}>Cancel</button>
                    <button onClick={handlePlaceOrder}>Place Order</button>
                  </>
                ) : (
                  <button onClick={handleConfirmOrder}>Confirm Order</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
export default CheckoutFlow;
