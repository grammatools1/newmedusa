"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Medusa from '@medusajs/medusa-js';
import ShippingForm from './ShippingForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Price from 'components/price';
import { DEFAULT_OPTION } from 'lib/constants';
import type { Cart } from 'lib/medusa/types';
import { createUrl } from 'lib/utils';
import Image from 'next/image';
import Link from 'next/link';

import DeleteItemButton from 'components/cart/delete-item-button';
import EditItemQuantityButton from 'components/cart/edit-item-quantity-button';

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

type MerchandiseSearchParams = {
  [key: string]: string;
};

function CheckoutFlow({ cart }: { cart: Cart | undefined }) {
  const quantityRef = useRef(cart?.totalQuantity);
  const [medusa, setMedusa] = useState<Medusa | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<keyof typeof PaymentMethod>('credit_card');
  const [couponCode, setCouponCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
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

 useEffect(() => {
  if (cart && medusa) {
    fetchCartItems(cart);
  }
}, [cart, medusa]);

  useEffect(() => {
    // Open cart modal when quantity changes.
    if (cart?.totalQuantity !== quantityRef.current) {
      // But only if it's not already open (quantity also changes when editing items in cart).

      // Always update the quantity reference
      quantityRef.current = cart?.totalQuantity;
    }
  }, [cart?.totalQuantity, quantityRef]);

/*
  useEffect(() => {
    fetchCartItems(cart);
  }, [cart]); */


 const fetchCartItems = async (cart: { id: string }) => {
  console.log('cart:', cart);
  if (!medusa) {
    console.error('Medusa not initialized');
   return 
   /*<div>Loading...</div>;*/
  }

  try {
    setLoading(true);
    const { cart: updatedCart } = await medusa.carts.retrieve(cart.id);
    setOrderTotal(updatedCart.total);
    setCartItems(updatedCart.items);
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
      setCouponCode('');

      toast.success('Coupon applied!', { autoClose: 3000 });
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon. Please try again or contact support.', { autoClose: 3000 });
    }
  };

  const handleApplyGiftCard = useCallback(async () => {
    if (!medusa || !cart || !giftCardCode) return;

    try {
      let cartData = cart;
      const { cart: updatedCart } = await medusa.carts.update(cart.id, {
        gift_cards: [{ code: giftCardCode }],
      });
      setOrderTotal(updatedCart.total);
      setGiftCardCode(''); // Clear the gift card code input field

      toast.success('Gift card applied!', { autoClose: 3000 });
    } catch (error) {
      console.error('Error applying gift card:', error);
      toast.error('Failed to apply gift card. Please try again or contact support.', { autoClose: 3000 });
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
              {!cart || cart.lines.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <p className="mt-6 text-center text-2xl font-bold">Your cart is empty.</p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="flex-grow overflow-auto py-4">
                    {cart.lines.map((item, i) => {
                      const merchandiseSearchParams = {} as MerchandiseSearchParams;

                      item.merchandise.selectedOptions.forEach(({ name, value }) => {
                        if (value !== DEFAULT_OPTION) {
                          merchandiseSearchParams[name.toLowerCase()] = value;
                        }
                      });

                      const merchandiseUrl = createUrl(
                        `/product/${item.merchandise.product.handle}`,
                        new URLSearchParams(merchandiseSearchParams)
                      );

                      return (
                        <li
                          key={i}
                          className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                        >
                          <div className="relative flex w-full flex-row justify-between px-1 py-4">
                            <div className="absolute z-40 -mt-2 ml-[55px]">
                              <DeleteItemButton item={item} />
                            </div>
                            <Link
                              href={merchandiseUrl}
                              className="z-30 flex flex-row space-x-4"
                            >
                              <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                <Image
                                  className="h-full w-full object-cover"
                                  width={64}
                                  height={64}
                                  alt={
                                    item.merchandise.product.featuredImage.altText ||
                                    item.merchandise.product.title
                                  }
                                  src={item.merchandise.product.featuredImage.url}
                                />
                              </div>

                              <div className="flex flex-1 flex-col text-base">
                                <span className="leading-tight">
                                  {item.merchandise.product.title}
                                </span>
                                {item.merchandise.title !== DEFAULT_OPTION ? (
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {item.merchandise.title}
                                  </p>
                                ) : null}
                              </div>
                            </Link>
                            <div className="flex h-16 flex-col justify-between">
                              <Price
                                className="flex justify-end space-y-2 text-right text-sm"
                                amount={item.cost.totalAmount.amount}
                                currencyCode={item.cost.totalAmount.currencyCode}
                              />
                              <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                <EditItemQuantityButton item={item} type="minus" />
                                <p className="w-6 text-center">
                                  <span className="w-full text-sm">{item.quantity}</span>
                                </p>
                                <EditItemQuantityButton item={item} type="plus" />
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>Taxes</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cart.cost.totalTaxAmount.amount}
                        currencyCode={cart.cost.totalTaxAmount.currencyCode}
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Shipping</p>
                      <p className="text-right">Calculated at checkout</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Total</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cart.cost.totalAmount.amount}
                        currencyCode={cart.cost.totalAmount.currencyCode}
                      />
                    </div>
                  </div>
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
                </div>
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
