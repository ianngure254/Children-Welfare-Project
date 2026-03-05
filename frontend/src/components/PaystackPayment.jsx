import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const PaystackPayment = ({ 
  email, 
  amount, 
  currency = 'NGN', 
  metadata = {}, 
  onSuccess, 
  onClose,
  disabled = false,
  className = '',
  children 
}) => {
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializePayment = async () => {
    if (!paystackLoaded) {
      toast.error('Payment gateway loading...');
      return;
    }

    setLoading(true);

    try {
      // First, initialize transaction on backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/paystack/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          currency,
          metadata: {
            ...metadata,
            custom_fields: [
              {
                display_name: "Product Purchase",
                variable_name: "product_purchase",
                value: "Body of Christ Children's Home"
              }
            ]
          }
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to initialize payment');
      }

      const { authorization_url, access_code, reference } = result.data;

      // Use Paystack popup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // Convert to kobo
        currency,
        ref: reference,
        metadata,
        callback: (response) => {
          // Payment successful callback
          handlePaymentSuccess(response);
        },
        onClose: () => {
          setLoading(false);
          if (onClose) onClose();
        },
      });

      // Open payment popup
      handler.openIframe();

    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error(error.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Verify payment on backend
      const verifyResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/paystack/verify/${response.reference}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const verifyResult = await verifyResponse.json();

      if (verifyResult.success) {
        toast.success('Payment successful!');
        if (onSuccess) onSuccess(verifyResult.data);
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={initializePayment}
      disabled={disabled || loading}
      className={`relative ${className}`}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default PaystackPayment;
