import React from 'react';
import Medusa from "@medusajs/medusa-js";

// Ensure that the environment variable is defined before using it
 baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;

// Check if the base URL is defined before creating Medusa instance
const medusa = new Medusa({medusaBaseUrl, maxRetries: 3 });

// Define prop types for the ShippingForm component
interface ShippingFormProps {
  cartId: string; // You might need to adjust the actual type of cartId
  onComplete: () => void; // Adjust the type of onComplete function if needed
}

const ShippingForm: React.FC<ShippingFormProps> = ({ cartId, onComplete }) => {
  const [shippingInfo, setShippingInfo] = React.useState({
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
  });
  const [selectedShippingMethod, setSelectedShippingMethod] = React.useState('Standard');
  const [shippingOptions, setShippingOptions] = React.useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = React.useState(null);

  const [countries, setCountries] = React.useState([]);
  const [validationErrors, setValidationErrors] = React.useState({});

  React.useEffect(() => {
    medusa.shippingOptions
      .listCartOptions(cartId)
      .then(({ shipping_options }) => {
        setShippingOptions(shipping_options);
        setSelectedShippingOption(shipping_options[0]?.id); // Default to the first option
      })
      .catch((error) => {
        console.error('Error fetching shipping options:', error);
      });

    // Fetch countries when the component mounts
    medusa.countries
      .list()
      .then(({ countries }) => {
        setCountries(countries);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });
  }, [cartId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prevShippingInfo) => ({
      ...prevShippingInfo,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleShippingOptionChange = (e) => {
    setSelectedShippingOption(e.target.value);
  };

  const handleSubmit = () => {
    const errors = {};

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

    // Update validation errors if any
    setValidationErrors(errors);

    // If there are no errors, proceed
    if (Object.keys(errors).length === 0) {
      medusa.carts
        .update(cartId, {
          shipping_address: shippingInfo,
          shipping_method: selectedShippingMethod,
        })
        .then(() => {
          if (selectedShippingMethod === 'Local Pickup') {
            // Handle local pickup scenario
            onComplete();
          } else {
            // Add the selected shipping method to the cart
            medusa.carts
              .addShippingMethod(cartId, {
                option_id: selectedShippingOption,
              })
              .then(({ cart }) => {
                console.log('Updated Shipping Methods:', cart.shipping_methods);
                // Call a function to move to the next step (e.g., payment method selection)
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
         <form>
        <div>
          <label>First Name:</label>
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
          <label>Last Name:</label>
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
          <label>Email:</label>
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
          <label>Company:</label>
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
          <label>Address 1:</label>
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
          <label>Address 2:</label>
          <input
            type="text"
            name="address_2"
            placeholder="Address 2 (optional)"
            value={shippingInfo.address_2}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>City:</label>
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
          <label>Country:</label>
          <select
            name="country_code"
            value={shippingInfo.country_code}
            onChange={handleInputChange}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.iso_2}>
                {country.name}
              </option>
            ))}
          </select>
          {validationErrors.country_code && (
            <span style={{ color: 'red' }}>{validationErrors.country_code}</span>
          )}
        </div>
        <div>
          <label>State/Province:</label>
          <input
            type="text"
            name="province"
            placeholder="State/Province"
            value={shippingInfo.province}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Postal Code:</label>
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
          <label>Phone:</label>
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
          <h3>Shipping Options</h3>
          {shippingOptions.map((option) => (
            <div key={option.id}>
              <label>
                <input
                  type="radio"
                  value={option.id}
                  checked={selectedShippingOption === option.id}
                  onChange={handleShippingOptionChange}
                />
                {option.name} - ${option.price}
              </label>
            </div>
          ))}
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedShippingMethod === 'Local Pickup'}
              onChange={() =>
                setSelectedShippingMethod(
                  selectedShippingMethod === 'Local Pickup' ? 'Standard' : 'Local Pickup'
                )
              }
            />
            Local Pickup
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
