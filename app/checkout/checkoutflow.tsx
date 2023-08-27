"use client"

import React, { useState, useEffect } from 'react';
import Medusa from "@medusajs/medusa-js";
import ShippingForm from './ShippingAddressForm'; // Import the ShippingForm component


interface CartItem {
  id: string;
  product: {
    title: string;
    // Other product properties
  };
  quantity: number;
  total: number;
  // Other cart item properties
}

const CheckoutFlow = () => {
  const [medusa, setMedusa] = useState<Medusa | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    const initializeMedusa = async () => {
      const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_API; // Make sure this is properly defined
      if (!medusaBaseUrl) {
        console.error('Medusa base URL is not defined.');
        return;
      }

      const initializedMedusa = new Medusa({
        baseUrl: medusaBaseUrl,
        maxRetries: 3,
      });
      setMedusa(initializedMedusa);
    };

    initializeMedusa();
  }, []);
  
 const cartId = "cart_01H88SMQFPQCRY7TVFW56GJVDB";
  
  const fetchCartItems = () => {
    if (medusa && cartId) {
      medusa.carts
        .retrieve(cartId)
        .then(({ cart }) => {
          setCartItems(cart.items);
          setOrderTotal(cart.total);
        })
        .catch((error) => {
          console.error('Error fetching cart items:', error);
        });
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [medusa]); // Refetch when medusa changes
  
  const handleShippingComplete = () => {
    setStep(2);
  };

  const handlePaymentComplete = () => {
    setStep(3);
  };

  const handlePlaceOrder = () => {
    if (medusa && cartId) {
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
    }
  };

  const handleApplyCoupon = () => {
    if (medusa && cartId && couponCode) {
      // Apply the discount code to the cart
      medusa.carts
        .update(cartId, {
          discounts: [
            {
              code: couponCode,
            },
          ],
        })
        .then(({ cart }) => {
          console.log(cart.discounts);
          setOrderTotal(cart.total);
        })
        .catch((error) => {
          console.error('Error applying discount code:', error);
          // Display an error to the customer
          alert('Discount is invalid');
        });
    }
  };

  const handleApplyGiftCard = () => {
    if (medusa && cartId && giftCardCode) {
      // Redeem the gift card and update the cart with the gift card
      medusa.carts
        .update(cartId, {
          gift_cards: [
            {
              code: giftCardCode,
            },
          ],
        })
        .then(({ cart }) => {
          console.log(cart.gift_cards.length);
          setOrderTotal(cart.total);
        })
        .catch((error) => {
          console.error('Error applying gift card:', error);
          // Handle the case where the gift card doesn't exist or is disabled
        });
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          {/* Step 1: Cart Review */}
          <h1>Step 1: Cart Review</h1>
          <div>
            {/* Display your cart items here */}
            {cartItems.length > 0 ? (
             cartItems.map((item) => (
             <div key={item.id}>
              <p>Product: {item.product.title}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Total Price: ${item.total}</p>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
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
      {step === 2 && (<ShippingForm  onComplete={handleShippingComplete} />
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


export default CheckoutFlow;
