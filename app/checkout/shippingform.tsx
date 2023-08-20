
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
