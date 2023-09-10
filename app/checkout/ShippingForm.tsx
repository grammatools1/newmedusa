"use client"

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Control, FormState, FieldError, useWatch, UnpackNestedValue } from 'react-hook-form'; // Updated import statement
import Medusa from '@medusajs/medusa-js';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ValidationError as YupValidationError } from 'yup';
import Autocomplete from 'react-autocomplete';
import FormFields, { CountryOption } from './formFields';

type CombinedFormData = {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  city: string;
  province?: string | null;
  countryCode: string;
  postalCode: string;
  phone: string;
  company?: string | null;
  acceptUpdates?: boolean | null;
  address2?: string | null; // Add this field if required
};

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
  province: yup.string().nullable(), // Make optional and nullable
  countryCode: yup.string().required(),
  postalCode: yup.string().required(),
  phone: yup.string().required(),
  company: yup.string().nullable(), // Make optional and nullable
  acceptUpdates: yup.boolean().nullable(), // Make optional and nullable
  address2: yup.string().nullable(), // Make optional and nullable
});

type Props = {
  cart: any; // Replace 'any' with your actual cart type
  onComplete: () => void;
  cartId?: string; // make cartId an optional prop
};

const ShippingForm = ({ cart, onComplete }: Props) => {
  const [medusa, setMedusa] = useState<Medusa | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FormErrors>();
  const [acceptUpdates, setAcceptUpdates] = useState(false);

  const {
    control,
    handleSubmit,
    formState,
  } = useForm<CombinedFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address1: '',
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

  type FormValues = UnpackNestedValue<typeof control>;

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

  const fetchCartItems = async (cart: { id: string }) => {
    // Check if medusa is not initialized
    if (!medusa) {
      console.error('Medusa not initialized');
      // You can handle this case accordingly, e.g., show a loading message
      // or return early if needed
      return;
    }

    try {
      const { cart: updatedCart } = await medusa.carts.retrieve(cart.id);
      console.log('updateCart:', updatedCart);
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
      fetchCartItems(cart);
    }
  }, [cart, medusa]);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        if (!medusa) {
          console.error('Medusa not initializ');
          return;
        }

        const { shipping_options } = await medusa.shippingOptions.list();
        setShippingOptions(shipping_options);
      } catch (error) {
        console.error('Error retrieving shipping options', error);
        setError(error as FormErrors);
      }
    };

    // Check if medusa is initialized before fetching shipping options
    if (medusa) {
      fetchShippingOptions();
    }
  }, [cart, medusa]);

  const handleFormSubmit = async (data: FormValues) => {
    const {
      firstName,
      lastName,
      email,
      address1,
      address2,
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
        const cartId = cart.id as string;

        // Update shipping address and method
        await medusa.carts.update(cartId, {
          shipping_address: {
            company: company || null,
            first_name: firstName,
            last_name: lastName,
            address_1: address1,
            address_2: address2 || null,
            city: city,
            country_code: countryCode,
            province: province || null,
            postal_code: postalCode,
            phone: phone,
          },
        });

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
              {typeof error === 'string'
                ? error
                : error instanceof Error
                ? error.message
                : ''}
            </div>
          )}
          <button type="submit">Save Shipping Address</button>
        </form>
      )}
    </div>
  );
};

export default ShippingForm;
