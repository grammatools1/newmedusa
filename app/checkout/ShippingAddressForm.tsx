"use client"

import React, { useEffect, useState } from 'react';
import Medusa from '@medusajs/medusa-js';
import { useCart, useCartShippingOptions } from 'medusa-react';

import ShippingFormFields from './ShippingFormFields';

const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }) : null;

interface CartData {
  id: string;
  // Add other properties based on the actual cart response
}

const ShippingForm = ({ onComplete }: { onComplete: () => void }) => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [shippingOptions, setShippingOptions] = useState([]);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const cartId = '<cartId>'; // Replace '<cartId>' with the actual cart ID

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (medusa) {
          const cartData = await medusa.carts.retrieve(cartId);
          setCart(cartData.cart);
        }
      } catch (error) {
        console.error('Error retrieving cart', error);
        setError('Error retrieving cart');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        if (medusa) {
          const { shipping_options } = await medusa.shippingOptions.list();
          console.log(shipping_options.length);
          setShippingOptions(shipping_options);
        }
      } catch (error) {
        console.error('Error retrieving shipping options', error);
        setError('Error retrieving shipping options');
      }
    };

    fetchShippingOptions();
  }, []);

  const handleSubmit = async () => {
    try {
      if (medusa && cart) {
        await medusa.carts.update(cart.id, {
          shipping_address: { ...updatedShippingInfo },
          shipping_method: selectedShippingMethod,
        });

        onComplete();
      }
    } catch (validationError) {
      const errors = {};
      // ... Handle validation errors
      setValidationErrors(errors);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Shipping Information</h2>
      <form>
        <ShippingFormFields
          cart={cart}
          shippingOptions={shippingOptions}
          selectedShippingMethod={selectedShippingMethod}
          setSelectedShippingMethod={setSelectedShippingMethod}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
          subscribeNewsletter={subscribeNewsletter}
          setSubscribeNewsletter={setSubscribeNewsletter}
        />

        <button type="button" onClick={handleSubmit}>
          Save Shipping Address
        </button>
      </form>
    </div>
  );
};

export default ShippingForm;
