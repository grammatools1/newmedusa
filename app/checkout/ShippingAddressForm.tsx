'use client';

import React, { useEffect, useState } from 'react';
import Medusa from '@medusajs/medusa-js';
import { useCart, useCartShippingOptions } from 'medusa-react';

import ShippingFormFields from './ShippingFormFields';

const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }) : null;

const ShippingForm = ({ onComplete }: { onComplete: () => void }) => {
  const [cart, setCart] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [shippingOptions, setShippingOptions] = useState([]);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        if (medusa && cart) {
          const shippingOptions = await medusa.shippingOptions.list({
            region: cart.region,
          });
          setShippingOptions(shippingOptions);
        }
      } catch (error) {
        console.error('Error retrieving shipping options', error);
        setError('Error retrieving shipping options');
      }
    };

    fetchShippingOptions();
  }, [cart]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Perform validation
      const errors = {};

      // ... Additional form validation

      setValidationErrors(errors);

      if (Object.keys(errors).length > 0) {
        setIsLoading(false);
        return;
      }

      if (!medusa) {
        setIsLoading(false);
        setError('Medusa is not available');
        return;
      }

      const updatedShippingInfo = {
        // ... Extract the shipping information from the form fields
      };

      await medusa.carts.update(cart?.id, {
        shipping_address: { ...updatedShippingInfo },
        shipping_method: selectedShippingMethod,
      });

      // Call the onComplete function or perform any other actions
      onComplete();
    } catch (validationError) {
      const errors = {};
      // ... Handle validation errors
      setValidationErrors(errors);
      setError('Error during form submission');
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
