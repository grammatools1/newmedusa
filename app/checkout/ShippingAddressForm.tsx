'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Medusa from "@medusajs/medusa-js";
import { useCart, useCartShippingOptions } from 'medusa-react';
import Autocomplete from 'react-autocomplete';
const countryListModule = require('country-list');
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  first_name: yup.string().required('First Name is required'),
  last_name: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  address_1: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  country_code: yup.string().required('Country is required'),
  postal_code: yup.string()
    .length(5)
    .matches(/^[0-9]{5}/)
    .required(),
  phone: yup.string().matches(/^\+(?:[0-9] ?){6,14}[0-9]$/, 'Invalid phone number').required('Phone is required'),
  company: Yup.string().required().minLength(3).maxLength(25)
});
const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }) : null;

type OnCompleteFunction = () => void;
type Props = {
  cartId: string;
};

const useClickOutside = (ref: React.RefObject<any>, onClickOutside: () => void) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClickOutside();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onClickOutside]);
};

const generateErrorMessage = (fieldName: string) => {
  return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
};

const ShippingForm = ({ onComplete }: { onComplete: OnCompleteFunction }) => {
  const innerRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(
    null
  );
  const [acceptUpdates, setAcceptUpdates] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('Standard');
  const [selectedShippingOption, setSelectedShippingOption] = useState<null | string>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({    
    company: '',
    first_name: '',
    last_name: '',
    email: '',
    address_1: '',
    address_2: '',
    city: '',
    province: '',
    postal_code: '',
    phone: '',
    country_code: '',

  });

  const [validationErrors, setValidationErrors] = useState({});
  
  const { cart } = useCart();

  
const ShippingOptions = ({ cartId }: Props) => {
  const { shipping_options, isLoading } = useCartShippingOptions(cartId);


 const countryOptions = useMemo(() => {
  const countryList = countryListModule.getNameList();
  return countryList.map((countryCode: string) => ({ // Explicitly type countryCode as string
    value: countryCode,
    label: countryListModule.getName(countryCode),
  }));
}, []);
  
  useEffect(() => {
    const handleClickOutside = () => {
      setSearchTerm('');
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (medusa) {
      medusa.shippingOptions
        .listCartOptions(cart?.id)
        .then(({ shipping_options }) => {
          setShippingOptions(shipping_options);
        })
        .catch((error) => {
          console.error('Error fetching shipping options:', error);
        });
    }
  }, [cart?.id]);

  const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


  const isPostalCodeRequired = (countryCode: string) => {
    const countriesRequiringPostalCode = ['US', 'CA', 'GB'];
    return countriesRequiringPostalCode.includes(countryCode);
  };
  
  const handleCountrySelect = (country: { value: string; label: string }) => {
    setSelectedCountry(country);
    setSearchTerm(country.label);
    setShippingInfo((prevShippingInfo) => ({
      ...prevShippingInfo,
      country_code: country.value,
    }));
  };

const handleClearCountry = () => {
  setSelectedCountry(null); // Clear the selected country
  setSearchTerm('');
  setShippingInfo((prevShippingInfo) => ({
    ...prevShippingInfo,
    country_code: '',
  }));
};

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);
};

  const handleInputChange = (e:  React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prevShippingInfo) => ({
      ...prevShippingInfo,
      [name]: value,
    }));
  };
  
  const handleShippingOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedOptionId = e.target.value;
  setSelectedShippingOption(selectedOptionId);
};
  const handleSubmit = async () => {
  try {
    // Validate shippingInfo using validationSchema
    await validationSchema.validate(shippingInfo, { abortEarly: false });

    // Include the acceptUpdates value in the payload
    const updatedShippingInfo = {
      ...shippingInfo,
      accept_updates: acceptUpdates,
    };

    // Update shipping address and method
    await medusa.carts.update(cart?.id, {
      shipping_address: { ...updatedShippingInfo },
      shipping_method: selectedShippingMethod,
    });

     if (Object.keys(errors).length === 0 && medusa) {
      try {
        await medusa.carts.update(cart?.id, {
          shipping_address: { ...shippingInfo },
          shipping_method: selectedShippingMethod,
        });

        if (selectedShippingMethod === 'Local Pickup') {
          onComplete();
        } else {
          await medusa.carts.addShippingMethod(cart?.id, {
            option_id: selectedShippingOption,
          });
          onComplete();
        }
      } catch (error) {
        console.error('Error updating shipping address:', error);
      }
    }

  } catch (validationError) {
    const errors = {};
    validationError.inner.forEach((error) => {
      errors[error.path] = error.message;
    });
    setValidationErrors(errors);
  }
};
  return (
    <div>
      <h2>Shipping Information</h2>
      <form>
        <div>
        <label htmlFor="first_name">First Name:</label>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={shippingInfo.first_name}
          onChange={handleInputChange}
        />
             {validationErrors && validationErrors.name && (
        <span style={{ color: 'red' }}>{validationErrors.name}</span>
      )}
      </div>  
      <div>
      <label htmlFor="last_name">Last Name:</label>
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={shippingInfo.last_name}
          onChange={handleInputChange}
        />
        {validationErrors.last_name && (
          <span style={{ color: 'red' }}>{validationErrors.last_name}</span>
        )}
      </div>
      <div>
      <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={shippingInfo.email}
          onChange={handleInputChange}
        />
        {validationErrors.email && (
          <span style={{ color: 'red' }}>{validationErrors.email}</span>
        )}
      </div>
          <div>
          <label htmlFor="accept_updates">
            <input
              type="checkbox"
              id="accept_updates"
              checked={acceptUpdates}
              onChange={() => setAcceptUpdates(!acceptUpdates)}
            />
            Accept Product Updates and Newsletters
          </label>
        </div>
      <div>
      <label htmlFor="address_1">Address 1:</label>
        <input
          type="text"
          name="address_1"
          placeholder="Address 1"
          value={shippingInfo.address_1}
          onChange={handleInputChange}
        />
        {validationErrors.address_1 && (
          <span style={{ color: 'red' }}>{validationErrors.address_1}</span>
        )}
      </div>
      <div>
      <label htmlFor="address_2">Address_2:</label>
        <input
          type="text"
          name="address_2"
          placeholder="Address 2 (optional)"
          value={shippingInfo.address_2}
          onChange={handleInputChange}
        />
      </div>
      <div>
      <label htmlFor="company">Company:</label>
        <input
          type="text"
          name="company"
          placeholder="Company (optional)"
          value={shippingInfo.company}
          onChange={handleInputChange}
        />
        {validationErrors.company && (
          <span style={{ color: 'red' }}>{validationErrors.company}</span>
        )}
      </div>
      <div>
      <label htmlFor="city">City:</label>
        <input
          type="text"
          name="city"
          placeholder="City"
          value={shippingInfo.city}
          onChange={handleInputChange}
        />
        {validationErrors.city && (
          <span style={{ color: 'red' }}>{validationErrors.city}</span>
        )}
      </div>
      <div>
          <label htmlFor="province">Province/State:</label>
          <input
            type="text"
            name="province"
            placeholder="State/Province"
            value={shippingInfo.province}
            onChange={handleInputChange}
          />
          {/* Include validation error handling for province */}
          {validationErrors.province && (
            <span style={{ color: 'red' }}>{validationErrors.province}</span>
          )}
        </div>
          <div>
               <label htmlFor="postal_code">Postal Code:</label>
              <input
              type="text"
              name="postal_code"
              placeholder="Postal Code"
              value={shippingInfo.postal_code}
              onChange={handleInputChange}
              />
              {validationErrors.postal_code && (
              <span style={{ color: 'red' }}>{validationErrors.postal_code}</span>
              )}
          </div>
         <div>
          <label htmlFor="country">Country:</label>
            <Autocomplete
            items={countryOptions}
            getItemValue={(item) => item.label}
            renderItem={(item, isHighlighted) => (
              <div
                style={{ background: isHighlighted ? 'lightgray' : 'white' }}
                key={item.value}
              >
                {item.label}
              </div>
            )}
            value={searchTerm}
            onChange={handleCountryChange}
            onSelect={handleCountrySelect}
            inputProps={{
              name: 'country',
              placeholder: 'Country',
            }}
          />
          {validationErrors.country && (
            <span style={{ color: 'red' }}>{validationErrors.country}</span>
          )}
        </div>
      <div>
      <label htmlFor="phone">Phone:</label>
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={shippingInfo.phone}
          onChange={handleInputChange}
        />
        {validationErrors.phone && (
          <span style={{ color: 'red' }}>{validationErrors.phone}</span>
        )}
       </div>
        <div>
      <label>Shipping Methods:</label>
      {isLoading && <span>Loading...</span>}
      {!isLoading && shipping_options && shipping_options.length === 0 && (
        <span>No shipping options</span>
      )}
      {!isLoading && shipping_options && (
        <ul>
          {shipping_options.map((shipping_option) => (
            <li key={shipping_option.id}>
              <input
                type="radio"
                value={shipping_option.id}
                checked={selectedShippingOption === shipping_option.id}
                onChange={handleShippingOptionChange}
              />
              {shipping_option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
        <div>
          <label htmlFor="local_pickup">
            <input
              type="checkbox"
              checked={selectedShippingMethod === 'Local Pickup'}
              onChange={() =>
                setSelectedShippingMethod(
                  selectedShippingMethod === 'Local Pickup' ? 'Standard' : 'Local Pickup'
                )
              }
            />
            Local Pickup:
          </label>
        </div>
        <button type="button" onClick={handleSubmit}>
          Save Shipping Address
        </button>
      </form>
    </div>
  );
};
};
export default ShippingForm;
