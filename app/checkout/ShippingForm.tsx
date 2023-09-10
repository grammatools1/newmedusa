"use client"

import React, { useState, useEffect } from 'react';
import { Controller, SubmitHandler, useForm, useWatch, FieldError } from 'react-hook-form';
import Medusa from '@medusajs/medusa-js';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ValidationError as YupValidationError } from 'yup';
import Autocomplete from 'react-autocomplete';
import FormFields, { CountryOption } from './formFields';

interface CombinedFormData {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  city: string;
  province?: string;
  countryCode: string;
  postalCode: string;
  phone: string;
  company?: string;
  acceptUpdates?: boolean;
}

interface ValidationError {
  path: string;
  message: string;
}

interface CustomError {
  [key: string]: string;
}

type FormErrors = CustomError | ValidationError[] | Error;

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  address1: yup.string().required(),
  city: yup.string().required(),
  province: yup.string(),
  countryCode: yup.string().required(),
  postalCode: yup.string().required(),
  phone: yup.string().required(),
  company: yup.string().notRequired(),
});

type Props = {
  cart: any; // Replace 'any' with your actual cart type
  onComplete: () => void;
  cartId?: string; // make cartId an optional prop
};

const ShippingForm = ({ cart, onComplete }: Props) => {
  const [medusa, setMedusa] = useState<Medusa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FormErrors>();
  const [acceptUpdates, setAcceptUpdates] = useState(false);

  const { control, handleSubmit, formState } = useForm<CombinedFormData>({
  resolver: async (data: CombinedFormData, context: any, options: any) => {
    try {
      const values = await validationSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      }) as CombinedFormData;

      return {
        values,
        errors: {},
      };
    } catch (errors) {
      return {
        values: {},
        errors: (errors as any)?.errors ?? {},
      };
    }
  },
  defaultValues: {
    firstName: '',
    lastName: '',
    email: '',
    address1: '',
    address_2: '',
    city: '',
    province: '',
    countryCode: '',
    postalCode: '',
    phone: '',
    company: '',
  },
  mode: 'onChange',
  shouldUnregister: true,
});

  const { errors } = formState;

  const countryOptions: CountryOption[] = React.useMemo(() => {
    const countryList = require('country-list');
    const countries = countryList.getNameList();

    if (!Array.isArray(countries)) {
      return [];
    }

    return countries.map((countryCode: string) => ({
      value: countryCode,
      label: countryList.getName(countryCode),
    }));
  }, []);

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

  const fetchCartItems = async (cartId: string) => {
    if (!medusa) {
      console.error('Medusa not initialized');
      return;
    }

    try {
      const { cart: updatedCart } = await medusa.carts.retrieve(cartId);
      console.log('Updated Cart:', updatedCart);
      // Replace below `console.log` statements with your own custom logic
    } catch (error) {
      console.error('Error fetching cart items:', error);
      // Replace below `toast` statement with your own custom logic
      console.error('Failed to fetch cart items. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (medusa && cart && cart.id) {
      fetchCartItems(cart.id);
    }
  }, [cart, medusa]);

 const handleFormSubmit: SubmitHandler<CombinedFormData> = async (data) => {
  const {
    firstName,
    lastName,
    email,
    address1,
    address2, // Add address2 from the form data
    city,
    province,
    countryCode,
    postalCode,
    phone,
    company,
    acceptUpdates,
  } = data;

  try {
    setIsLoading(true);
    setError(undefined);

    if (medusa && cart && cart.id) {
      const cartId = cart.id as string; // Type assertion

      // Create an object with updated shipping address
      const updatedShippingAddress = {
        company,
        first_name: firstName,
        last_name: lastName,
        email,
        address_1: address1,
        address_2: address2, // Add address2
        city,
        country_code: countryCode,
        province,
        postal_code: postalCode,
        phone,
        acceptUpdates,
      };

      // Update shipping address and method using Medusa
      const { cart: updatedCart } = await medusa.carts.update(cartId, {
        shipping_address: updatedShippingAddress,
      });

      console.log(updatedCart.shipping_address);
      onComplete();
    }
  } catch (error) {
    if (error instanceof YupValidationError) {
      setError(new Error('Validation error: ' + error.message) as FormErrors);
    } else {
      setError(error as FormErrors);
    }
  } finally {
    setIsLoading(false);
  }
};


  const selectedCountryCode = useWatch({ control, name: 'countryCode' });

  return (
    <div>
      <h2>Shipping Information</h2>
      {isLoading && <div>Loading...</div>}
      {!isLoading && (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormFields
            control={control}
            acceptUpdates={acceptUpdates}
            setAcceptUpdates={setAcceptUpdates}
            errors={errors as Record<keyof CombinedFormData, FieldError>}
            countryOptions={countryOptions}
            onSelectCountryCode={() => {}}
          />
          {error && (
            <div style={{ color: 'red' }}>
              {typeof error === 'string' ? error : error instanceof Error ? error.message : ''}
            </div>
          )}
          <button type="submit">Save Shipping Address</button>
        </form>
      )}
    </div>
  );
};

export default ShippingForm;
