import React from 'react';
import ShippingForm from './ShippingAddressForm'; // Import the ShippingForm component (provide the correct path)
import Medusa from "@medusajs/medusa-js";

const Checkoutflow = () => {
  const MEDUSA_BACKEND_API = 'process.env.MEDUSA_API_KEY'; // Replace with your Medusa backend API URL
  const medusa = new Medusa({ baseUrl:process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API, maxRetries: 3 });

  // State to store cartId
  const cartId = localStorage.getItem("cart_id");

  // State hooks used in multiple parts of the component
  const [cartItems, setCartItems] = React.useState([]); // Store cart items
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(''); // Selected payment method
  const [couponCode, setCouponCode] = React.useState(''); // Coupon code input
  const [giftCardCode, setGiftCardCode] = React.useState(''); // Gift card code input
  const [orderTotal, setOrderTotal] = React.useState(0); // Order total amount
  const [step, setStep] = React.useState(1); // Current step of the checkout process

  // Function to proceed to the next shipping step
  const handleShippingComplete = () => {
    setStep(2);
  };

  // Function to proceed to the next payment step
  const handlePaymentComplete = () => {
    setStep(3);
  };

  // Function to handle placing the order
  const handlePlaceOrder = () => {
    // Final step: Complete the checkout process
    const paymentData = {
      provider_id: selectedPaymentMethod,
      data: {
        // Add any required payment data for the selected method (e.g., crypto wallet address)
      },
    };

    medusa.carts
      .setPaymentSession(cartId, paymentData)
      .then(() => {
        return medusa.carts.complete(cartId);
      })
      .then(({ type, data }) => {
        console.log('Checkout Completed:', type, data);
        // Display order confirmation or handle any further actions
      })
      .catch((error) => {
        console.error('Error completing checkout:', error);
      });
  };

  // Function to apply a coupon code
  const handleApplyCoupon = () => {
    // Apply the coupon code and update the order total
    medusa.carts
      .applyCoupon(cartId, couponCode)
      .then(({ cart }) => {
        setOrderTotal(cart.total);
      })
      .catch((error) => {
        console.error('Error applying coupon:', error);
      });
  };

  // Function to apply a gift card code
  const handleApplyGiftCard = () => {
    // Apply the gift card code and update the order total
    medusa.carts
      .applyGiftCard(cartId, giftCardCode)
      .then(({ cart }) => {
        setOrderTotal(cart.total);
      })
      .catch((error) => {
        console.error('Error applying gift card:', error);
      });
  };

  // JSX rendering based on the current step
  return (
    <div>
      {step === 1 && (
        <div>
          {/* Step 1: Cart Review */}
          <h1>Step 1: Cart Review</h1>
          <div>
            {/* Display your cart items here */}
            {cartItems.map((item) => (
              <div key={item.id}>
                <p>Product: {item.product.title}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Total Price: ${item.total}</p>
              </div>
            ))}
            <div>
              <label>Coupon Code:</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button onClick={handleApplyCoupon}>Apply Coupon</button>
            </div>
            <div>
              <label>Gift Card Code:</label>
              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
              />
              <button onClick={handleApplyGiftCard}>Apply Gift Card</button>
            </div>
            <p>Order Total: ${orderTotal}</p>
          </div>
          <button onClick={handleShippingComplete}>Proceed to Shipping</button>
        </div>
      )}
      {step === 2 && (
        <ShippingForm cartId={cartId} onComplete={handleShippingComplete} />
      )}
      {step === 3 && (
        <div>
          {/* Step 3: Payment Method Selection */}
          <h1>Step 3: Payment Method Selection</h1>
          <div>
            {/* Display payment method options */}
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={selectedPaymentMethod === 'credit_card'}
                onChange={() => setSelectedPaymentMethod('credit_card')}
              />
              Credit Card
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={selectedPaymentMethod === 'paypal'}
                onChange={() => setSelectedPaymentMethod('paypal')}
              />
              PayPal
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="crypto"
                checked={selectedPaymentMethod === 'crypto'}
                onChange={() => setSelectedPaymentMethod('crypto')}
              />
              Cryptocurrency
            </label>
            {/* Add more payment method options */}
          </div>
          <button onClick={handlePaymentComplete}>Proceed to Order Review</button>
        </div>
      )}
       {step === 4 && (
        <div>
          {/* Step 4: Order Review */}
          <h1>Step 4: Order Review</h1>
          <div>
            {/* Display order summary */}
            <p>Selected Payment Method: {selectedPaymentMethod}</p>
            {/* Display other order details like shipping method, total price, etc. */}
          </div>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      )}
    </div>
  );
};

export default Checkoutflow;
