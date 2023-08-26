import React from 'react';
import { Controller, Control } from 'react-hook-form';
import Autocomplete from 'react-autocomplete';
const countryListModule = require('country-list');

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

type ShippingFormFieldsProps = {
  control: Control<CombinedFormData>;
  acceptUpdates: boolean;
  setAcceptUpdates: (value: boolean) => void;
  errors: any; // Replace with your error type
  countryOptions: any[]; // Replace with your country options type
};

const ShippingFormFields = ({
  control,
  acceptUpdates,
  setAcceptUpdates,
  errors,
  countryOptions,
}: ShippingFormFieldsProps) => {
  
  const countryList = countryListModule.getData();

  return (
    <>
      {/* First Name */}
      <Controller
        name="firstName"
        control={control}
        defaultValue=""
        rules={{ required: 'First Name is required' }}
        render={({ field }) => (
          <div>
            <label htmlFor="firstName">First Name:</label>
            <input {...field} type="text" />
            {errors.firstName && (
              <span style={{ color: 'red' }}>{errors.firstName.message}</span>
            )}
          </div>
        )}
      />
      
      {/* Last Name */}
      <Controller
        name="lastName"
        control={control}
        defaultValue=""
        rules={{ required: 'Last Name is required' }}
        render={({ field }) => (
          <div>
            <label htmlFor="lastName">Last Name:</label>
            <input {...field} type="text" />
            {errors.lastName && (
              <span style={{ color: 'red' }}>{errors.lastName.message}</span>
            )}
          </div>
        )}
      />
      {/* Email */}
      <Controller
        name="email"
        control={control}
        defaultValue=""
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        }}
        render={({ field }) => (
          <div>
            <label htmlFor="email">Email:</label>
            <input {...field} type="email" />
            {errors.email && (
              <span style={{ color: 'red' }}>{errors.email.message}</span>
            )}
          </div>
          )}
          />
    <div>
  <label htmlFor="acceptUpdates">
    <input
      type="checkbox"
      id="acceptUpdates"
      checked={acceptUpdates}
      onChange={() => setAcceptUpdates(!acceptUpdates)}
    />
    Accept Product Updates and Newsletters
  </label>
</div>

<div>
  <label htmlFor="address1">Address:</label>
  <Controller
    name="address1"
    control={control}
    defaultValue=""
    render={({ field }) => (
      <input
        type="text"
        {...field}
      />
    )}
    rules={{ required: 'Address is required' }}
  />
  {errors.address1 && (
    <span style={{ color: 'red' }}>{errors.address1.message}</span>
  )}
</div>

<div>
  <label htmlFor="city">City:</label>
  <Controller
    name="city"
    control={control}
    defaultValue=""
    render={({ field }) => (
      <input
        type="text"
        {...field}
      />
    )}
    rules={{ required: 'City is required' }}
  />
  {errors.city && (
    <span style={{ color: 'red' }}>{errors.city.message}</span>
  )}
</div>

<div>
  <label htmlFor="province">Province:</label>
  <Controller
    name="province"
    control={control}
    defaultValue=""
    render={({ field }) => (
      <input
        type="text"
        {...field}
      />
    )}
  />
</div>

<div>
  <label htmlFor="postalCode">Postal Code:</label>
  <Controller
    name="postalCode"
    control={control}
    defaultValue=""
    render={({ field }) => (
      <input
        type="text"
        {...field}
      />
    )}
    rules={{
      pattern: {
        value: /^\d{5}(-\d{4})?$/,
        message: 'Invalid postal code',
      },
      required: 'Postal code is required',
    }}
  />
  {errors.postalCode && (
    <span style={{ color: 'red' }}>{errors.postalCode.message}</span>
  )}
</div>
<div>
  <label htmlFor="countryCode">Country:</label>
  <Controller
    name="countryCode"
    control={control}
    defaultValue=""
    rules={{ required: 'Country is required' }}
    render={({ field }) => (
      <Autocomplete
        {...field}
        renderInput={(params) => (
          <input
            {...params}
            type="text"
            placeholder="Country"
            autoComplete="off"
          />
        )}
        renderItem={(item, isHighlighted) => (
          <div
            key={item.value}
            style={{ background: isHighlighted ? 'lightgray' : 'white' }}
          >
            {item.label}
          </div>
        )}
        getItemValue={(item) => item.label}
        items={countryOptions}
      />
    )}
  />
  {errors.countryCode && (
    <span style={{ color: 'red' }}>{errors.countryCode.message}</span>
  )}
</div>

<div>
  <label htmlFor="phone">Phone:</label>
  <Controller
    name="phone"
    control={control}
    defaultValue=""
    rules={{
      pattern: {
        value: /^\+(?:[0-9] ?){6,14}[0-9]$/,
        message: 'Invalid phone number',
      },
      required: 'Phone is required',
    }}
    render={({ field }) => (
      <input
        {...field}
        type="text"
      />
    )}
  />
  {errors.phone && (
    <span style={{ color: 'red' }}>{errors.phone.message}</span>
  )}
</div>

<div>
  <label htmlFor="company">Company:</label>
  <Controller
    name="company"
    control={control}
    defaultValue=""
    rules={{ minLength: { value: 3, message: 'Company name must be at least 3 characters long' } }}
    render={({ field }) => (
      <input
        {...field}
        type="text"
      />
    )}
  />
  {errors.company && (
    <span style={{ color: 'red' }}>{errors.company.message}</span>
  )}
</div>
   {/* Add more form fields here */}
      
    </>
  );
};

export default ShippingFormFields;
