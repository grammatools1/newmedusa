"use client"

import React, { useState, useEffect } from 'react';
import Medusa from "@medusajs/medusa-js";
import ShippingForm from './ShippingAddressForm'; // Import the ShippingForm component

const CheckoutFlow = () => {
const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API;
const medusa = medusaBaseUrl ? new Medusa({ baseUrl: medusaBaseUrl, maxRetries: 3 }): null;

  const cartId = localStorage.getItem("cart_id");

  const [cartItems, setCartItems] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Fetch cart items
    if (cartId) {
      medusa.carts.retrieve(cartId)
        .then(({ cart }) => {
          setCartItems(cart.items);
          setOrderTotal(cart.total);
        })
        .catch((error) => {
          console.error('Error fetching cart:', error);
        });
    }
  }, [cartId]);

  const handleShippingComplete = () => {
    setStep(2);
  };

  const handlePaymentComplete = () => {
    setStep(3);
  };

  const handlePlaceOrder = () => {
    const paymentData = {
      provider_id: selectedPaymentMethod,
      data: {
        // Add any required payment data for the selected method
      },
    };

    medusa.carts.setPaymentSession(cartId, paymentData)
      .then(() => {
        return medusa.carts.complete(cartId);
      })
      .then(({ type, data }) => {
        console.log('Checkout Completed:', type, data);
        // Display order confirmation or handle further actions
      })
      .catch((error) => {
        console.error('Error completing checkout:', error);
      });
  };

  const handleApplyCoupon = () => {
    medusa.carts.applyCoupon(cartId, couponCode)
      .then(({ cart }) => {
        setOrderTotal(cart.total);
      })
      .catch((error) => {
        console.error('Error applying coupon:', error);
      });
  };

  const handleApplyGiftCard = () => {
    medusa.carts.applyGiftCard(cartId, giftCardCode)
      .then(({ cart }) => {
        setOrderTotal(cart.total);
      })
      .catch((error) => {
        console.error('Error applying gift card:', error);
      });
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h1>Step 1: Cart Review</h1>
          {/* Display cart items */}
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
          <button onClick={handleShippingComplete}>Proceed to Shipping</button>
        </div>
      )}
      {step === 2 && (
        <ShippingForm cartId={cartId} onComplete={handleShippingComplete} />
      )}
      {step === 3 && (
        <div>
          <h1>Step 3: Payment Method Selection</h1>
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
          {/* Add more payment method options */}
          <button onClick={handlePaymentComplete}>Proceed to Order Review</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <h1>Step 4: Order Review</h1>
          <p>Selected Payment Method: {selectedPaymentMethod}</p>
          {/* Display other order details */}
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      )}
    </div>
  );
};

export default CheckoutFlow;
