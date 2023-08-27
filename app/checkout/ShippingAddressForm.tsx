"use client"

import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import Medusa from '@medusajs/medusa-js';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ValidationError } from 'yup';
import ShippingFormFields from './ShippingFormFields';

interface Props {
  cart: any; // Replace 'any' with your actual cart type
  onComplete: () => void;
}

interface CombinedFormData {
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

interface FormErrors {
  [key: string]: string;
}

const validationSchema = yup.object().shape({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  address1: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  province: yup.string().notRequired(),
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

const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }) : null;

const ShippingForm = ({ cart, onComplete }: Props) => {
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [acceptUpdates, setAcceptUpdates] = useState(false);

  const { control, handleSubmit, formState } = useForm<CombinedFormData>({
    resolver: yupResolver(validationSchema),
  });

  const { errors } = formState as { errors: FormErrors }; // Use type assertion to declare the type of errors

  const countryOptions = React.useMemo(() => {
    const countries = require('country-list').getNameList();
    return countries.map((countryCode: string) => ({
      value: countryCode,
      label: require('country-list').getName(countryCode),
    }));
  }, []);

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
            render={({ field }) => <input {...field} placeholder="Address" />}
          />
          <Controller
            name="city"
            control={control}
            defaultValue=""
            render={({ field }) => <input {...field} placeholder="City" />}
          />
          <Controller
            name="postalCode"
            control={control}
            defaultValue=""
            render={({ field }) => <input {...field} placeholder="Postal Code" />}
          />
          {selectedCountryCode === 'US' && (
            <Controller
              name="province"
              control={control}
              defaultValue=""
              render={({ field }) => <input {...field} placeholder="State" />}
            />
          )}
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            render={({ field }) => <input {...field} placeholder="Phone" />}
          />
          <Controller
            name="firstName"
            control={control}
            defaultValue=""
            render={({ field }) => <input {...field} placeholder="First Name" />}
          />
          <Controller
            name="lastName"
            control={control}
            defaultValue=""
            render={({ field }) => <input {...field} placeholder="Last Name" />}
          />
          <Controller
            name="email"
            control={control}
            defaultValue=""
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
          {Object.keys(errors).length > 0 && (
            <ul>
              {Object.keys(errors).map((key) => (
                <li key={key}>{errors[key]}</li>
              ))}
            </ul>
          )}
          <button type="submit">Save Shipping Address</button>
        </form>
      )}
    </div>
  );
};

export default ShippingForm;
