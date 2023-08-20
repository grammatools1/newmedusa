import React, { forwardRef, useEffect, useRef, useState, useMemo } from 'react';
import Medusa from "@medusajs/medusa-js";
import { useCart, useRegions, useShippingMethods } from 'medusa-react';
import { getCountries } from 'country-list';
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }) : null;

const ShippingForm = forwardRef(({ onComplete }, ref) => {
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('Standard');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    company: '',
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    country_code: '',
    province: '',
    postal_code: '',
    phone: '',
    email: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  const { regions } = useRegions();
  const { cart } = useCart();
  const { shippingMethods } = useShippingMethods();

  const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
     }; 
     const isPostalCodeRequired = (countryCode) => {
        // Replace this logic with your actual logic to determine if postal code is required
        const countriesRequiringPostalCode = ['US', 'CA', 'GB']; // Example countries
        return countriesRequiringPostalCode.includes(countryCode);
      };

  const countryOptions = useMemo(() => {
    const currentRegion = regions?.find((r) => r.id === cart?.region_id);

    if (!currentRegion) {
      return [];
    }

    return currentRegion.countries.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    }));
  }, [regions, cart]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!innerRef.current.contains(e.target)) {
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ... (validateEmail, handleSelectOption, handleShippingOptionChange, handleInputChange)

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
  }, [cart]);

  const handleSubmit = () => {
    const errors = {};

    if (!selectedOption) {
      errors.country = 'Country is required';
    }

      // Validate required fields
      if (!shippingInfo.first_name.trim()) {
        errors.first_name = 'First Name is required';
      }
      if (!shippingInfo.last_name.trim()) {
        errors.last_name = 'Last Name is required';
      }
      if (!shippingInfo.address_1.trim()) {
        errors.address_1 = 'Address is required';
      }
      if (!shippingInfo.city.trim()) {
        errors.city = 'City is required';
      }
      if (!shippingInfo.country_code) {
        errors.country_code = 'Country is required';
      }
      if (!/^\+(?:[0-9] ?){6,14}[0-9]$/.test(shippingInfo.phone)) {
        errors.phone = 'Invalid phone number';
      }
  
      // Validate postal code (optional)
      if (
        shippingInfo.postal_code.trim() &&
        !/^[0-9]{5}(?:-[0-9]{4})?$/.test(shippingInfo.postal_code)
      ) {
        errors.postal_code = 'Invalid Postal Code';
      }
  
      // Validate company (optional)
      if (shippingInfo.company.trim() && shippingInfo.company.length < 3) {
        errors.company = 'Company name must be at least 3 characters';
      }
  
      if (!validateEmail(shippingInfo.email)) {
        errors.email = 'Invalid email address';
      }
      

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0 && medusa) {
      medusa.carts
        .update(cart?.id, {
          shipping_address: { ...shippingInfo },
          shipping_method: selectedShippingMethod,
        })
        .then(() => {
          if (selectedShippingMethod === 'Local Pickup') {
            onComplete();
          } else {
            medusa.carts
              .addShippingMethod(cart?.id, {
                option_id: selectedShippingOption,
              })
              .then(({ cart }) => {
                console.log('Updated Shipping Methods:', cart.shipping_methods);
                onComplete();
              })
              .catch((error) => {
                console.error('Error adding shipping method:', error);
              });
          }
        })
        .catch((error) => {
          console.error('Error updating shipping address:', error);
        });
    }
  };
  return (
    <div>
      <h2>Shipping Information</h2>
      {clientLoaded && (
      <form>
        <div>
          <label htmlFor="country">Country:</label>
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={searchTerm}
            onChange={handleInputChange}
          />
          {validationErrors.country && (
            <span style={{ color: 'red' }}>{validationErrors.country}</span>
          )}
             <ul>
            {countryOptions.map(({ value, label }, index) => (
              <li
                key={index}
                onClick={() => handleSelectOption(value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSelectOption(value);
                  }
                }}
                role="option"
                aria-selected={value === selectedOption}
              >
                {label}
              </li>
            ))}
          </ul>
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
          <select
            value={selectedShippingMethod}
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
      )}
    </div>
  );
});
 

export default ShippingForm;
