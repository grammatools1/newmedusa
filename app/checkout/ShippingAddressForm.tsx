"use client"

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Medusa, { ValidationError } from '@medusajs/medusa-js';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ShippingFormFields from './ShippingFormFields';
import countryListModule from 'country-list';

const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }) : null;

const validationSchema = yup.object().shape({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  address1: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  countryCode: yup.string().required('Country is required'),
  postalCode: yup
    .string()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid postal code')
    .required('Postal code is required'),
  phone: yup
    .string()
    .matches(/^\+(?:[0-9] ?){6,14}[0-9]$/, 'Invalid phone number')
    .required('Phone is required'),
  company: yup.string().min(3, 'Company name must be at least 3 characters long'),
});

const ShippingForm = ({ onComplete }) => {
  const { control, handleSubmit, errors } = useForm({
    resolver: yupResolver(validationSchema),
  });
 
  const [cart, setCart] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Replace with actual cart ID
  const cartId = '<cartId>';

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
          setShippingOptions(shipping_options);
        }
      } catch (error) {
        console.error('Error retrieving shipping options', error);
        setError('Error retrieving shipping options');
      }
    };

    fetchShippingOptions();
  }, []);

  const handleFormSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');

      if (medusa && cart) {
        // Update shipping address and method
        await medusa.carts.update(cart.id, {
          shipping_address: {
            company: data.company,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            address_1: data.address1,
            address_2: data.address2,
            city: data.city,
            country_code: data.countryCode,
            postal_code: data.postalCode,
            phone: data.phone,
            // Add other shipping address properties as needed
          },
          shipping_method: selectedShippingMethod,
        });

        // Clear validation errors on success
        setError('');
        onComplete(); // Optionally, show a success message or redirect
      }
    } catch (validationError) {
      // Handle specific validation errors or network errors
      if (validationError instanceof ValidationError) {
        setError('Validation error: ' + validationError.message);
      } else {
        setError('An error occurred while updating shipping information.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const countryOptions = React.useMemo(() => {
    const countries = countryListModule.getNameList();
    return countries.map((countryCode) => ({
      value: countryCode,
      label: countryListModule.getName(countryCode),
    }));
  }, []);

  return (
    <div>
      <h2>Shipping Information</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
      <ShippingFormFields
  control={control}
  acceptUpdates={subscribeNewsletter}
  setAcceptUpdates={setSubscribeNewsletter}
  errors={errors}
  countryOptions={countryOptions}
/>
<div>
  <label htmlFor="acceptUpdates">
    <Controller
      as={<input type="checkbox" />}
      control={control}
      name="acceptUpdates"
      defaultValue={subscribeNewsletter}
    />
    Receive product updates and newsletters
  </label>
</div>
{error && <div style={{ color: 'red' }}>{error}</div>}
<button type="submit">Save Shipping Address</button>
</form>
</div>
);
};

export default ShippingForm;
