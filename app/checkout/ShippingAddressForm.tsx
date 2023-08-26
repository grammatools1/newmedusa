"use client"

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Medusa from '@medusajs/medusa-js';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ShippingFormFields from './ShippingFormFields';
import { ValidationError } from 'yup';
const countryListModule = require('country-list');

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
  company: yup.string().min(3, 'Company name must be at least 3 characters long')
});

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  countryCode: string;
  postalCode: string;
  phone: string;
  company?: string;
  acceptUpdates: boolean;
}
const ShippingForm = ({ onComplete }: { onComplete: () => void }) => {
  const { control, handleSubmit, formState } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { errors } = formState;
  const [cart, setCart] = useState<any>(null); // Replace 'any' with your actual cart type
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptUpdates, setAcceptUpdates] = useState(false);


   const countryOptions = React.useMemo(() => {
    const countries = countryListModule.getNameList();
    return countries.map((countryCode: string) => ({
      value: countryCode,
      label: countryListModule.getName(countryCode),
    }));
  }, []);

  const cartId = '<cartId>'; // Replace with actual cart ID

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

const handleFormSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError('');

      if (medusa && cart && cart.id) {
        const cartId = cart.id as string; // Type assertion

        // Update shipping address and method
        await medusa.carts.update(cartId, {
        shipping_address: {
            company: data.company,
            first_name: data.firstName,
            last_name: data.lastName,
            address_1: data.address1,
            address_2: data.address2 || undefined,
            city: data.city,
            province: data.province,
            postal_code: data.postalCode,
            country_code: data.countryCode,
            phone: data.phone,
            acceptUpdates: data.acceptUpdates,
          },
          shipping_method: selectedShippingMethod,
        });

        setError('');
        onComplete();
      }
    } catch (validationError) {
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

  return (
    <div>
      <h2>Shipping Information</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
         <ShippingFormFields
              control={control}
              acceptUpdates={acceptUpdates}
              setAcceptUpdates={setAcceptUpdates}
              errors={errors}
              countryOptions={countryOptions}
            />

        <div>
          <label htmlFor="acceptUpdates">
            <input
              type="checkbox"
              checked={acceptUpdates}
              onChange={() => setAcceptUpdates(!acceptUpdates)}
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
