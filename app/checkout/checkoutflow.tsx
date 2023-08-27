"use client"

import React, { useState, useEffect } from 'react';
import Medusa from '@medusajs/medusa-js';
import ShippingForm from './ShippingAddressForm';
import Cart from './cart';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PaymentMethod {
    credit_card: {
      card_number: string;
      exp_month: string;
      exp_year: string;
      cvv: string;
    };
    paypal: {
      email: string;
    };
    crypto: {
      wallet_address: string;
    };
    [key: string]: {
      [key: string]: string;
    };
  }
  
  interface Props {
    cart: {
      id: string;
      items: CartItem[];
      total: number;
    };
  }
  
  function CheckoutFlow({ cart }: Props) {
    const [medusa, setMedusa] = useState<Medusa | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<keyof PaymentMethod>('credit_card');
    const [couponCode, setCouponCode] = useState('');
    const [giftCardCode, setGiftCardCode] = useState('');
    const [orderTotal, setOrderTotal] = useState(cart.total);
    const [cartItems, setCartItems] = useState(cart.items);
    const [step, setStep] = useState(1);
  
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
        setMedusa(initializedMedusa);
      };
  
      initializeMedusa();
    }, []);
  
    useEffect(() => {
      fetchCartItems();
    }, [cart]);
  
    const fetchCartItems = async () => {
      if (!medusa) return;
  
      try {
        setLoading(true);
        const { cart } = await medusa.carts.retrieve(cart.id);
        setOrderTotal(cart.total);
        setCartItems(cart.items);
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
        // TODO: Display order confirmation or handle any further actions
      } catch (error) {
        console.error('Error completing checkout:', error);
        toast.error('Failed to place order. Please try again or contact support.', { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
  
    const handleApplyCoupon = async () => {
      if (!medusa || !couponCode) {
        return;
      }
  
      setLoading(true);
      try {
        const { cart } = await medusa.carts.update(cart.id, {
          discounts: [{ code: couponCode }],
        });
        setOrderTotal(cart.total);
        setCouponCode('');
        toast.info('Coupon applied successfully!', { autoClose: 3000 });
      } catch (error) {
        console.error('Error applying discount code:', error);
        toast.error('Failed to apply coupon code. Please try again or contact support.', { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
  
    const handleApplyGiftCard = async () => {
      if (!medusa || !giftCardCode) {
        return;
      }
  
      setLoading(true);
      try {
        const { cart } = await medusa.carts.update(cart.id, {
          gift_cards: [{ code: giftCardCode }],
        });
        setOrderTotal(cart.total);
        setGiftCardCode('');
        toast.info('Gift card applied successfully!', { autoClose: 3000 });
      } catch (error) {
        console.error('Error applying gift card:', error);
        toast.error('Failed to apply gift card. Please try again or contact support.', { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
  
    const handleGoBack = () => {
      setStep(step - 1);
    };
  
    const handleNextStep = () => {
      setStep(step + 1);
    };
  
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
                <CartItems items={cartItems} total={orderTotal} />
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
                    <button onClick={handleApplyCoupon}>Apply Coupon</button>
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
                    <button onClick={handleApplyGiftCard}>Apply Gift Card</button>
                  </div>
                </div>
                <p className="order-total">Order Total: ${orderTotal.toFixed(2)}</p>
                <ShippingForm onComplete={handleShippingComplete} />
              </div>
            )}
            {step === 2 && (
              <div>
                {/* Step 2: Shipping Information */}
                <h1>Step 2: Shipping Information</h1>
                <button onClick={handleGoBack}>Go back</button>
                <ShippingForm onComplete={handleNextStep} />
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
                      onChange={() => setSelectedPaymentMethod('credit_card')}
                    />
                    Credit Card
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={selectedPaymentMethod === 'paypal'}
                      onChange={() => setSelectedPaymentMethod('paypal')}
                    />
                    PayPal
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="crypto"
                      checked={selectedPaymentMethod === 'crypto'}
                      onChange={() => setSelectedPaymentMethod('crypto')}
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
                <button onClick={handlePlaceOrder}>Place Order</button>
              </div>
            )}
          </div>
        )}
      </>
    );
  }
  
  export default CheckoutFlow;
  
