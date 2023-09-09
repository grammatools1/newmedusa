import React from 'react';
import { Controller, Control, FieldError, useForm } from 'react-hook-form';
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
}: FormFieldsProps) => {
  const { watch } = useForm<CombinedFormData>();
  const selectedCountryCode = watch('countryCode');
  const initialCountryOptions: CountryOption[] = [];
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);

  useEffect(() => {
    // Fetch and convert the country list
    const countries = countryList.getData();
    const options = countries.map((country: any) => ({
      value: country.code,
      label: country.name,
    }));
    setCountryOptions(options);
  }, []);

  return (
    <>
      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-500 text-white py-2 px-4 mb-4">
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
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-gray-700 font-bold mb-2">
              First Name:
            </label>
            <input
              {...field}
              type="text"
              aria-label="First Name"
              className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
            />
            {errors.firstName && (
              <span className="text-red-500">Please enter your first name</span>
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
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-gray-700 font-bold mb-2">
              Last Name:
            </label>
            <input
              {...field}
              type="text"
              aria-label="Last Name"
              className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
            />
            {errors.lastName && (
              <span className="text-red-500">Please enter your last name</span>
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
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email:
            </label>
            <input
              {...field}
              type="email"
              aria-label="Email"
              className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
            />
            {errors.email && (
              <span className="text-red-500">{errors.email.message}</span>
            )}
          </div>
        )}
      />

      {/* Subscribe to Updates checkbox */}
      <div className="mb-4">
        <input
          type="checkbox"
          id="acceptUpdates"
          checked={acceptUpdates}
          onChange={() => setAcceptUpdates(!acceptUpdates)}
          className="mr-2 leading-tight"
        />
        <label htmlFor="acceptUpdates" className="text-gray-700 font-bold">
          Receive product updates and newsletters
        </label>
      </div>

      {/* Address */}
      <div className="mb-4">
        <label htmlFor="address1" className="block text-gray-700 font-bold mb-2">
          Address:
        </label>
        <Controller
          name="address1"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <input
              {...field}
              type="text"
              aria-label="Address"
              className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
            />
          )}
          rules={{ required: 'Address is required' }}
        />
        {errors.address1 && (
          <span className="text-red-500">Please enter your address</span>
        )}
      </div>

      {/* City */}
      <div className="mb-4">
        <label htmlFor="city" className="block text-gray-700 font-bold mb-2">
          City:
        </label>
        <Controller
          name="city"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <input
              {...field}
              type="text"
              aria-label="City"
              className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
            />
          )}
          rules={{ required: 'City is required' }}
        />
        {errors.city && (
          <span className="text-red-500">Please enter your city</span>
        )}
      </div>

      {/* State or Province */}
      {selectedCountryCode === 'US' && (
        <div className="mb-4">
          <label htmlFor="province" className="block text-gray-700 font-bold mb-2">
            State:
          </label>
          <Controller
            name="province"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <input
                {...field}
                type="text"
                aria-label="State"
                className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
              />
            )}
          />
        </div>
      )}

      {/* Postal Code */}
      <div className="mb-4">
        <label htmlFor="postalCode" className="block text-gray-700 font-bold mb-2">
          Postal Code:
        </label>
        <Controller
          name="postalCode"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <input
              {...field}
              type="text"
              aria-label="Postal Code"
              className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
            />
          )}
          rules={{
            pattern: {
              value: /^\d{5}(-\d{4})?$/,
              message: 'Please enter a valid postal code',
            },
            required: 'Postal code is required',
          }}
        />
        {errors.postalCode && (
          <span className="text-red-500">{errors.postalCode.message}</span>
        )}
      </div>

     {/* Country */}
<div className="mb-4">
  <label htmlFor="countryCode" className="block text-gray-700 font-bold mb-2">
    Country:
  </label>
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
            autoComplete="on"
            aria-label="Country"
            className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
          />
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
    <span className="text-red-500">Please select your country</span>
  )}
</div>


      {/* Phone */}
      <div className="mb-4">
        <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">
          Phone:
        </label>
        <Controller
          name="phone"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <input
              {...field}
              type="text"
              aria-label="Phone Number"
              className="w-full border-b-2 border-gray-300 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
            />
          )}
          rules={{
            pattern: {
              value: /^\+(?:[0-9] ?){6,14}[0-9]$/,
              message: 'Please enter a valid phone number',
            },
            required: 'Phone is required',
          }}
        />
        {errors.phone && (
          <span className="text-red-500">{errors.phone.message}</span>
        )}
      </div>

      {/* Company */}
      {/* Optional field - omitted for brevity */}
    </>
  );
};

export default FormFields;
