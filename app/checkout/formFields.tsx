import React from 'react';
import { Controller, Control, FieldError,useWatch } from 'react-hook-form';
import Autocomplete from 'react-autocomplete';
const countryList = require('country-list');

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

export type FormFieldsProps = {
  control: Control<CombinedFormData>;
  acceptUpdates: boolean;
  setAcceptUpdates: (value: boolean) => void;
  errors: Record<keyof CombinedFormData, FieldError>;
  onSelectCountryCode: (value: string) => void;
  countryOptions: CountryOption[];
};

export type CountryOption = {
  value: string;
  label: string;
};

const FormFields = ({
  control,
  acceptUpdates,
  setAcceptUpdates,
  errors,
  onSelectCountryCode,
  countryOptions,
}: FormFieldsProps) => {
  const selectedCountryCode = control.watch('countryCode');

  return (
    <>
      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div style={{ backgroundColor: 'red', color: 'white', padding: '1rem'}}>
          {Object.values(errors).map((error: any) => (
            <div key={error.message}>{error.message}</div>
          ))}
        </div>
      )}
      
      {/* First Name */}
      <Controller
        name="firstName"
        control={control}
        defaultValue=""
        rules={{ required: 'First name is required' }}
        render={({ field }) => (
          <div>
            <label htmlFor="firstName">First Name:</label>
            <input {...field} type="text" aria-label="First Name" />
            {errors.firstName && (
              <span style={{ color: 'red' }}>Please enter your first name</span>
            )}
          </div>
        )}
      />

      {/* Last Name */}
      <Controller
        name="lastName"
        control={control}
        defaultValue=""
        rules={{ required: 'Last name is required' }}
        render={({ field }) => (
          <div>
            <label htmlFor="lastName">Last Name:</label>
            <input {...field} type="text" aria-label="Last Name" />
            {errors.lastName && (
              <span style={{ color: 'red' }}>Please enter your last name</span>
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
            message: 'Please enter a valid email address',
          },
        }}
        render={({ field }) => (
          <div>
            <label htmlFor="email">Email:</label>
            <input {...field} type="email" aria-label="Email" />
            {errors.email && (
              <span style={{ color: 'red' }}>{errors.email.message}</span>
            )}
          </div>
        )}
      />

      {/* Subscribe to Updates checkbox */}
      <div>
        <input
          type="checkbox"
          id="acceptUpdates"
          checked={acceptUpdates}
          onChange={() => setAcceptUpdates(!acceptUpdates)}
        />
        <label htmlFor="acceptUpdates">Receive product updates and newsletters</label>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address1">Address:</label>
        <Controller
          name="address1"
          control={control}
          defaultValue=""
          render={({ field }) => <input {...field} type="text" aria-label="Address" />}
          rules={{ required: 'Address is required' }}
        />
        {errors.address1 && (
          <span style={{ color: 'red' }}>Please enter your address</span>
        )}
      </div>

      {/* City */}
      <div>
        <label htmlFor="city">City:</label>
        <Controller
          name="city"
          control={control}
          defaultValue=""
          render={({ field }) => <input {...field} type="text" aria-label="City" />}
          rules={{ required: 'City is required' }}
        />
        {errors.city && (
          <span style={{ color: 'red' }}>Please enter your city</span>
        )}
      </div>

      {/* State or Province */}
      {selectedCountryCode === 'US' && (
        <div>
          <label htmlFor="province">State:</label>
          <Controller
            name="province"
            control={control}
            defaultValue=""
            render={({ field }) => <input {...field} type="text" aria-label="State" />}
          />
        </div>
      )}

      {/* Postal Code */}
      <div>
        <label htmlFor="postalCode">Postal Code:</label>
        <Controller
          name="postalCode"
          control={control}
          defaultValue=""
          render={({ field }) => <input {...field} type="text" aria-label="Postal Code" />}
          rules={{
            pattern: {
              value: /^\d{5}(-\d{4})?$/,
              message: 'Please enter a valid postal code',
            },
            required: 'Postal code is required',
          }}
        />
        {errors.postalCode && (
          <span style={{ color: 'red' }}>{errors.postalCode.message}</span>
        )}
      </div>

      {/* Country */}
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
                <input {...props} type="text" placeholder="Country" autoComplete="off" aria-label="Country" />
              )}
              value={
                field.value &&
                countryOptions.find((option) => option.value === field.value)?.label
                  ? field.value
                  : ''
              }
              onChange={(event) => field.onChange(event.target.value)}
              onSelect={(value) => {
                field.onChange(value);
                onSelectCountryCode(value);
              }}
            />
          )}
        />
        {errors.countryCode && (
          <span style={{ color: 'red' }}>Please select your country</span>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone">Phone:</label>
        <Controller
          name="phone"
          control={control}
          defaultValue=""
          render={({ field }) => <input {...field} type="text" aria-label="Phone Number" />}
          rules={{
            pattern: {
              value: /^\+(?:[0-9] ?){6,14}[0-9]$/,
              message: 'Please enter a valid phone number',
            },
            required: 'Phone is required',
          }}
        />
        {errors.phone && (
          <span style={{ color: 'red' }}>{errors.phone.message}</span>
        )}
      </div>

      {/* Company */}
      {/* Optional field - omitted for brevity */}
    </>
  );
};

export default FormFields;
