"use client"

import React, { useState, useEffect } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import Medusa from '@medusajs/medusa-js';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ValidationError as YupValidationError } from 'yup';
import ShippingFormFields from './ShippingFormFields';

interface Props {
  cart: any; // Replace 'any' with your actual cart type
  onComplete: () => void;
}

export interface CombinedFormData {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  city: string;
  province: string | undefined;
  countryCode: string;
  postalCode: string;
  phone: string;
  company: string;
}

interface ValidationError {
  path: string;
  message: string;
}

interface CustomError {
  [key: string]: string;
}

type FormErrors = CustomError | ValidationError[];

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

const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }) : null;

const ShippingForm = ({ cart, onComplete }: Props) => {
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FormErrors>();
  const [acceptUpdates, setAcceptUpdates] = useState(false);

  const { control, handleSubmit, formState } = useForm<CombinedFormData>({
    resolver: async (data: CombinedFormData, context: any, options: any) => {
      try {
        // Cast the data object to the expected type - this will throw 
        // an error if any required fields are missing
        const values = await validationSchema.validate(data, {
          abortEarly: false,
          stripUnknown: true,
        }) as CombinedFormData;

        // If validation succeeds, we can return the validated data object
        return {
          values,
          errors: undefined,
        };

      } catch (errors) {
        // If there are any validation errors, return them
        return {
          values: {},
          errors: (errors as any)?.errors ?? {}, // Cast 'errors' as 'any' to bypass TypeScript type checking
        };
      }
    },
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

  const { errors } = formState;

  const countryOptions = React.useMemo(() => {
    const countries = require('country-list').getNameList();
    return countries.map((countryCode: string) => ({
      value: countryCode,
      label: require('country-list').getName(countryCode),
    }));
  }, []);

  useEffect(() => {
    if (!cart) {
      return;
    }

    const fetchCartItems = async () => {
      if (!medusa) {
        console.error('Medusa not initialized');
        return;
      }

      try {
        setIsLoading(true);
        const { cart: updatedCart } = await medusa.carts.retrieve(cart.id);
        // Replace below `console.log` statements with your own custom logic
        console.log(`Total: ${updatedCart.total}`);
        console.log(`Items: ${JSON.stringify(updatedCart.items)}`);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        // Replace below `toast` statement with your own custom logic
        console.error('Failed to fetch cart items. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [cart]);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        if (!medusa) {
          console.error('Medusa not initialized');
          return;
        }

        const { shipping_options } = await medusa.shippingOptions.list();
        setShippingOptions(shipping_options);
      } catch (error) {
        console.error('Error retrieving shipping options', error);
        setError(error as FormErrors);
      }
    };

    fetchShippingOptions();
  }, []);

  const handleFormSubmit: SubmitHandler<CombinedFormData> = async (data) => {
    const {
      firstName,
      lastName,
      email,
      address1,
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

        // Update shipping address and method
        await medusa.carts.update(cartId, {
          shipping_address: {
            company: company,
            first_name: firstName,
            last_name: lastName,
            email: email,
            address_1: address1,
            city: city,
            province: province,
            postal_code: postalCode,
            country_code: countryCode,
            phone: phone,
            acceptUpdates: acceptUpdates,
          },
          shipping_method: selectedShippingMethod,
        });

        onComplete();
      }
    } catch (error) {
      if (error instanceof YupValidationError) {
        setError(new Error('Validation error: ' + error.message) as FormErrors);
      } else {
        setError(new Error('An error occurred while updating shipping information.') as FormErrors);
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
          <Controller
            name="countryCode"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <select {...field}>
                <option value="" disabled>
                  Select country
                </option>
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
          <Controller
            name="address1"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} placeholder="Address" />}
          />
          <Controller
            name="city"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} placeholder="City" />}
          />
          <Controller
            name="postalCode"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} placeholder="Postal Code" />}
          />
          {selectedCountryCode === 'US' && (
            <Controller
              name="province"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => <input {...field} placeholder="State" />}
            />
          )}
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} placeholder="Phone" />}
          />
          <Controller
            name="firstName"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} placeholder="First Name" />}
          />
          <Controller
            name="lastName"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} placeholder="Last Name" />}
          />
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} placeholder="Email" />}
          />
          <Controller
            name="company"
            control={control}
            defaultValue=""
            render={({ field }) => <input {...field} placeholder="Company" />}
          />
          <div>
            <input
              type="checkbox"
              checked={acceptUpdates}
              onChange={() => setAcceptUpdates(!acceptUpdates)}
            />
            <label htmlFor="acceptUpdates">
              Receive product updates and newsletters
            </label>
          </div>
          {error && <div style={{ color: 'red' }}>{error.message}</div>}
          <button type="submit">Save Shipping Address</button>
        </form>
      )}
    </div>
  );
};

export default ShippingForm;
