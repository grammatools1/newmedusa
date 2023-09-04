"use client"

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Medusa from '@medusajs/medusa-js';
import ShippingForm from './ShippingForm';

type Props = {
  cartId: string;
  onCartUpdate: (cart: { id: string }) => void;
  onComplete: () => void;
};

function CheckoutFlow({ cartId, onCartUpdate, onComplete }: Props) {
  const [shippingAddress, setShippingAddress] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [medusa, setMedusa] = useState<Medusa | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);

  useEffect(() => {
    const initializeMedusa = async () => {
      const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;

      if (!medusaBaseUrl) {
        console.error('Medusa base URL is not defined.');
        return;
      }

      try {
        const initializedMedusa = new Medusa({
          baseUrl: medusaBaseUrl,
          maxRetries: 3,
        });
        console.log('Initialized Medusa:', initializedMedusa);
        setMedusa(initializedMedusa);
      } catch (error) {
        console.error('Error initializing Medusa:', error);
      }
    };

    initializeMedusa();
  }, []);

  useEffect(() => {
    if (cartId && medusa) {
      fetchShippingProfile(cartId);
    }
  }, [cartId, medusa]);

  const fetchShippingProfile = async (cartId: string) => {
    console.log('fetching shipping profile for cartId:', cartId);

    if (!medusa) {
      console.error('Medusa not initialized');
      return;
    }

    try {
      setLoading(true);
      const { cart } = await medusa.carts.retrieve(cartId);

      if (!cart) {
        console.error('Cart data is undefined or null');
        return;
      }

      setOrderTotal(cart.total);
      console.log('orderTotal:', cart.total);

      const { profile_id: profileId } = cart;
      const { shipping_profile } = await medusa.cartShippingProfiles.retrieve({
        cart_id: cartId,
        profile_id: profileId,
      });

      if (!shipping_profile) {
        console.error('Shipping profile data is undefined or null');
        return;
      }

      setShippingMethods(shipping_profile.shipping_methods);
      console.log('shippingMethods:', shipping_profile.shipping_methods);
    } catch (error) {
      console.error('Error fetching shipping profile:', error);
      toast.error('Failed to fetch shipping profile. Please refresh the page.', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleShippingComplete = async () => {
    console.log('handleShippingComplete()');

    if (!medusa || !cartId) {
      console.error('Medusa not initialized or cart ID not present');
      return;
    }

    try {
      setLoading(true);
      const { cart } = await medusa.carts.retrieve(cartId);

      if (!cart) {
        console.error('Cart data is undefined or null');
        return;
      }

      const { profile_id: profileId } = cart;
      const result = await medusa.checkout.complete({ cart_id: cartId, profile_id: profileId });

      if (result.status === 'ok') {
        console.log('checkout completed successfully!');
        onComplete();
      } else {
        console.error('checkout failed:', result.message);
        toast.error(`Failed to complete checkout: ${result.message}`, { autoClose: 3000 });
      }
    } catch (error) {
      console.error('Error completing checkout:', error);
      toast.error('Failed to complete checkout. Please refresh the page.', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />

      {loading && <div className="loader">Loading...</div>}

      {!loading && shippingMethods && (
        <>
          <div className="shipping-methods">
            <h2>Shipping Methods</h2>
            <div>
              {shippingMethods.map((method) => (
                <div key={method.id}>
                  <label>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      onChange={() => console.log('selected method:', method)}
                    />
                    {method.name}
                    <span>{`$${method.price.toFixed(2)}`}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="checkout-actions">
            {orderTotal !== null && (
              <p className="order-total">Order Total: ${orderTotal.toFixed(2)}</p>
            )}
            <ShippingForm cartId={cartId} onComplete={handleShippingComplete} onCartUpdate={onCartUpdate} />
            {/* pass onCartUpdate prop to ShippingForm */}
          </div>
        </>
      )}
    </>
  );
}

export default CheckoutFlow;
