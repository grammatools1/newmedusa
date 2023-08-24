import React from 'react';
import { useField } from 'formik';
import Autocomplete from 'react-autocomplete';
const countryListModule = require('country-list');
import * as yup from 'yup';

// Validation schema
const validationSchema = yup.object().shape({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  address1: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  countryCode: yup.string().required('Country is required'),
  postalCode: yup
    .string()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid postal code')
    .required('Postal code is required'),
  phone: yup
    .string()
    .matches(/^\+(?:[0-9] ?){6,14}[0-9]$/, 'Invalid phone number')
    .required('Phone is required'),
  company: yup.string().min(3, 'Company name must be at least 3 characters long'),
});

interface ShippingFormFieldsProps {
  cart: CartData | null;
  shippingOptions: never[]; // Replace `never[]` with the correct type of your shippingOptions
  selectedShippingMethod: string;
  setSelectedShippingMethod: React.Dispatch<React.SetStateAction<string>>;
  validationErrors: any; // Replace `any` with the appropriate type for validationErrors
  setValidationErrors: React.Dispatch<React.SetStateAction<any>>; // Replace `any` with the appropriate type for setValidationErrors
  subscribeNewsletter: boolean;
  setSubscribeNewsletter: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShippingFormFields: React.FC<ShippingFormFieldsProps> = ({
  cart,
  shippingOptions,
  selectedShippingMethod,
  setSelectedShippingMethod,
  subscribeNewsletter,
  setSubscribeNewsletter,
}) => {
  const countryOptions = React.useMemo(() => {
    const countryList = countryListModule.getNameList();
    return countryList.map((countryCode) => ({
      value: countryCode,
      label: countryListModule.getName(countryCode),
    }));
  }, []);

  const renderErrorMessage = (field) => {
    const meta = field.meta;
    return meta.touched && meta.error && <span style={{ color: 'red' }}>{meta.error}</span>;
  };

  const [fieldFirstName, metaFirstName] = useField('firstName');
  const [fieldLastName, metaLastName] = useField('lastName');
  const [fieldEmail, metaEmail] = useField('email');
  const [fieldAddress1, metaAddress1] = useField('address1');
  const [fieldCity, metaCity] = useField('city');
  const [fieldPostalCode, metaPostalCode] = useField('postalCode');
  const [fieldCountryCode, metaCountryCode] = useField('countryCode');
  const [fieldPhone, metaPhone] = useField('phone');
  const [fieldCompany, metaCompany] = useField('company');

  return (
    <>
      <div>
        <label htmlFor="firstName">First Name:</label>
        <input type="text" name="firstName" {...fieldFirstName} />
        {renderErrorMessage(metaFirstName)}
      </div>
      <div>
        <label htmlFor="lastName">Last Name:</label>
        <input type="text" name="lastName" {...fieldLastName} />
        {renderErrorMessage(metaLastName)}
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="text" name="email" {...fieldEmail} />
        {renderErrorMessage(metaEmail)}
      </div>
      <div>
        <label htmlFor="subscribeNewsletter">
          <input
            type="checkbox"
            id="subscribeNewsletter"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
          />
          Subscribe to Product Updates and Newsletters
        </label>
      </div>
      <div>
        <label htmlFor="address1">Address:</label>
        <input type="text" name="address1" {...fieldAddress1} />
        {renderErrorMessage(metaAddress1)}
      </div>
      <div>
        <label htmlFor="address2">Address 2:</label>
        <input type="text" name="address2" />
      </div>
      <div>
        <label htmlFor="city">City:</label>
        <input type="text" name="city" {...fieldCity} />
        {renderErrorMessage(metaCity)}
      </div>
      <div>
        <label htmlFor="province">Province:</label>
        <input type="text" name="province" />
      </div>
      <div>
        <label htmlFor="postalCode">Postal Code:</label>
        <input type="text" name="postalCode" {...fieldPostalCode} />
        {renderErrorMessage(metaPostalCode)}
      </div>
      <div>
        <label htmlFor="countryCode">Country:</label>
        <Autocomplete
          name="countryCode"
          renderInput={(params) => (
            <input {...params} type="text" placeholder="Country" autoComplete="off" />
          )}
          renderItem={(item, isHighlighted) => (
            <div key={item.value} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
              {item.label}
            </div>
          )}
          value={({ onChange, value }) => (
            <input onChange={(e) => onChange(e.target.value)} value={value} style={{ display: 'none' }} readOnly />
          )}
          items={countryOptions}
          getItemValue={(item) => item.label}
          onSelect={([item]) => item.value}
        />
        {renderErrorMessage(metaCountryCode)}
      </div>
      <div>
        <label htmlFor="phone">Phone:</label>
        <input type="text" name="phone" {...fieldPhone} />
        {renderErrorMessage(metaPhone)}
      </div>
      <div>
        <label htmlFor="company">Company:</label>
        <input type="text" name="company" {...fieldCompany} />
        {renderErrorMessage(metaCompany)}
      </div>
    </>
  );
};

export default ShippingFormFields;
