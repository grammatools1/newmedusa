'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Medusa from "@medusajs/medusa-js";
import { useCart, useCartShippingOptions } from 'medusa-react';
import Autocomplete from 'react-autocomplete';
const countryListModule = require('country-list');

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
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('Standard');
  const [selectedShippingOption, setSelectedShippingOption] = useState<null | string>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
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
    company: '',
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
    const errors: { [key: string]: string } = {};

    if (!selectedCountry) {
      errors.country = generateErrorMessage('country');
    }

    if (!shippingInfo.first_name.trim()) {
      errors.first_name = generateErrorMessage('first name');
    }
    if (!shippingInfo.last_name.trim()) {
      errors.last_name = generateErrorMessage('last name');
    }
    if (!shippingInfo.address_1.trim()) {
      errors.address_1 = generateErrorMessage('address');
    }
    if (!shippingInfo.city.trim()) {
      errors.city = generateErrorMessage('city');
    }
    if (!shippingInfo.country_code) {
      errors.country_code = generateErrorMessage('country');
    }
    if (!/^\+(?:[0-9] ?){6,14}[0-9]$/.test(shippingInfo.phone)) {
      errors.phone = 'Invalid phone number';
    }

    if (
      shippingInfo.postal_code.trim() &&
      !/^[0-9]{5}(?:-[0-9]{4})?$/.test(shippingInfo.postal_code)
    ) {
      errors.postal_code = 'Invalid Postal Code';
    }

    if (shippingInfo.company.trim() && shippingInfo.company.length < 3) {
      errors.company = 'Company name must be at least 3 characters';
    }

    if (!validateEmail(shippingInfo.email)) {
      errors.email = 'Invalid email address';
    }
    setValidationErrors(errors);

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
          {validationErrors && validationErrors.hasOwnProperty('first_name') && (
            <span style={{ color: 'red' }}>{validationErrors.first_name}</span>
          )}
        </div>
        <div>
      <label htmlFor="first_name">First Name:</label>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={shippingInfo.first_name}
          onChange={handleInputChange}
        />
        {validationErrors.first_name && (
          <span style={{ color: 'red' }}>{validationErrors.first_name}</span>
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
      </div>
      {isPostalCodeRequired(shippingInfo.country_code) && (
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
          )}
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
