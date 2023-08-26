import React from 'react';
import { Controller } from 'react-hook-form';
import Autocomplete from 'react-autocomplete';
import countryListModule from 'country-list';

interface ShippingFormFieldsProps {
  control: Control<FormData>;
  acceptUpdates: boolean; // Add this line
  setAcceptUpdates: React.Dispatch<React.SetStateAction<boolean>>; // Add this line
  errors: DeepMap<FormData, FieldError>;
  countryOptions: { value: string; label: string }[];
}

const ShippingFormFields = ({
  control,
  acceptUpdates, // Add this line
  setAcceptUpdates, // Add this line
  errors,
  countryOptions,
}: ShippingFormFieldsProps) => {
  
  const countryList = countryListModule.getData();

  return (
    <>
      <div>
        <label htmlFor="firstName">First Name:</label>
        <Controller
          as={<input />}
          name="firstName"
          control={control}
          defaultValue=""
          rules={{ required: 'First Name is required' }}
        />
        {errors.firstName && (
          <span style={{ color: 'red' }}>{errors.firstName.message}</span>
        )}
      </div>
      
      <div>
        <label htmlFor="lastName">Last Name:</label>
        <Controller
          as={<input />}
          name="lastName"
          control={control}
          defaultValue=""
          rules={{ required: 'Last Name is required' }}
        />
        {errors.lastName && (
          <span style={{ color: 'red' }}>{errors.lastName.message}</span>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email:</label>
        <Controller
          as={<input type="email" />}
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
        />
        {errors.email && (
          <span style={{ color: 'red' }}>{errors.email.message}</span>
        )}
      </div>
      
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
          as={<input />}
          name="address1"
          control={control}
          defaultValue=""
          rules={{ required: 'Address is required' }}
        />
        {errors.address1 && (
          <span style={{ color: 'red' }}>{errors.address1.message}</span>
        )}
      </div>
      
      <div>
        <label htmlFor="address2">Address 2:</label>
        <Controller as={<input />} name="address2" control={control} defaultValue="" />
      </div>
      
      <div>
        <label htmlFor="city">City:</label>
        <Controller
          as={<input />}
          name="city"
          control={control}
          defaultValue=""
          rules={{ required: 'City is required' }}
        />
        {errors.city && (
          <span style={{ color: 'red' }}>{errors.city.message}</span>
        )}
      </div>
      
      <div>
        <label htmlFor="province">Province:</label>
        <Controller as={<input />} name="province" control={control} defaultValue="" />
      </div>
      
      <div>
        <label htmlFor="postalCode">Postal Code:</label>
        <Controller
          as={<input />}
          name="postalCode"
          control={control}
          defaultValue=""
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
          as={Autocomplete}
          name="countryCode"
          control={control}
          defaultValue=""
          rules={{ required: 'Country is required' }}
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
          value={({ onChange, value }) => (
            <input
              onChange={(e) => onChange(e.target.value)}
              value={value}
              style={{ display: 'none' }}
              readOnly
            />
          )}
          items={countryOptions}
          getItemValue={(item) => item.label}
        />
        {errors.countryCode && (
          <span style={{ color: 'red' }}>{errors.countryCode.message}</span>
        )}
      </div>
      
      <div>
        <label htmlFor="phone">Phone:</label>
        <Controller
          as={<input />}
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
        />
        {errors.phone && (
          <span style={{ color: 'red' }}>{errors.phone.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="company">Company:</label>
        <Controller
          as={<input />}
          name="company"
          control={control}
          defaultValue=""
          rules={{ minLength: { value: 3, message: 'Company name must be at least 3 characters long' } }}
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
