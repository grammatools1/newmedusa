import React from 'react';
import { Controller, Control } from 'react-hook-form';
import Autocomplete from 'react-autocomplete';
const countryListModule = require('country-list');

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

type ShippingFormFieldsProps = {
  control: Control<CombinedFormData>;
  acceptUpdates: boolean;
  setAcceptUpdates: (value: boolean) => void;
  errors: any; // Replace with your error type
  countryOptions: CountryOption[]; // Replace with your country options type
};

type CountryOption = {
  value: string;
  label: string;
};

const ShippingFormFields = ({
  control,
  acceptUpdates,
  setAcceptUpdates,
  errors,
  countryOptions,
}: ShippingFormFieldsProps) => {
  const countryList = countryListModule.default();
  const selectedCountryCode = control.watch('countryCode');

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
        <input
          type="checkbox"
          checked={acceptUpdates}
          onChange={() => setAcceptUpdates(!acceptUpdates)}
        />
        <label htmlFor="acceptUpdates">
          Receive product updates and newsletters
        </label>
      </div>

      <div>
        <label htmlFor="address1">Address:</label>
        <Controller
          name="address1"
          control={control}
          defaultValue=""
          render={({ field }) => <input type="text" {...field} />}
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
          render={({ field }) => <input type="text" {...field} />}
          rules={{ required: 'City is required' }}
        />
        {errors.city && (
          <span style={{ color: 'red' }}>{errors.city.message}</span>
        )}
      </div>

      {selectedCountryCode === 'US' && (
        <div>
          <label htmlFor="province">State:</label>
          <Controller
            name="province"
            control={control}
            defaultValue=""
            render={({ field }) => <input type="text" {...field} />}
          />
        </div>
      )}

      <div>
        <label htmlFor="postalCode">Postal Code:</label>
        <Controller
          name="postalCode"
          control={control}
          defaultValue=""
          render={({ field }) => <input type="text" {...field} />}
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
              getItemValue={(option) => option.label}
              items={countryOptions}
              renderItem={(option, isHighlighted) => (
                <div
                  key={option.value}
                  style={{
                    background: isHighlighted ? 'lightgray' : 'white',
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                >
                  {option.label}
                </div>
              )}
              renderInput={(props) => (
                <input
                  {...props}
                  type="text"
                  placeholder="Country"
                  autoComplete="off"
                />
              )}
              value={
                field.value &&
                countryOptions.find((option) => option.value === field.value)?.label
                  ? field.value
                  : ''
              }
              onChange={(event) => field.onChange(event.target.value)}
              onSelect={(value) => field.onChange(value)}
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
          render={({ field }) => <input type="text" {...field} />}
          rules={{
            pattern: {
              value: /^\+(?:[0-9] ?){6,14}[0-9]$/,
              message: 'Invalid phone number',
            },
            required: 'Phone is required',
          }}
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
          rules={{
            minLength: { value: 3, message: 'Company name must be at least 3 characters long' },
          }}
          render={({ field }) => <input type="text" {...field} />}
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
