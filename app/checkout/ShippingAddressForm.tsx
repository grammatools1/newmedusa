'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Medusa from "@medusajs/medusa-js";
import { useCart, useCartShippingOptions } from 'medusa-react';
import Autocomplete from 'react-autocomplete';
import ShippForm from './shippingform';
const { getName, getNameList } = require('country-list');

const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }) : null;

const useClickOutside = (ref, onClickOutside) => {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClickOutside();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onClickOutside]);
};

const generateErrorMessage = (fieldName) => {
  return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
};

const ShippingForm = ({ onComplete }) => {
  const innerRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
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
  const { shippingMethods } = useCartShippingOptions();

  const countryOptions = useMemo(() => {
    const countryList = getNameList();
    return countryList.map((countryCode) => ({
      value: countryCode,
      label: getName(countryCode),
    }));
  }, []);

  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('Standard');

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPostalCodeRequired = (countryCode) => {
    const countriesRequiringPostalCode = ['US', 'CA', 'GB'];
    return countriesRequiringPostalCode.includes(countryCode);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSearchTerm(country.label);
    setShippingInfo((prevShippingInfo) => ({
      ...prevShippingInfo,
      country_code: country.value,
    }));
  };

  const handleCountryChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prevShippingInfo) => ({
      ...prevShippingInfo,
      [name]: value,
    }));
  };

  const handleShippingOptionChange = (e) => {
    const selectedOptionId = e.target.value;
    setSelectedShippingOption(selectedOptionId);
  };

  const handleSubmit = async () => {
    const errors = {};

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
        <ShippForm />
        <div>
          <label>Shipping Methods:</label>
          <select
            value={selectedShippingOption}
            onChange={handleShippingOptionChange}
          >
            {shippingOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} - ${option.price}
              </option>
            ))}
          </select>
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

export default ShippingForm;
