import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPaymentRequest, createOrderRequest } from '../../api/orderApi';
import useCart from '../../hooks/useCart';


const PENDING_ORDER_KEY = 'pendingOrder';

const CheckoutVerify = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    const completeOrder = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      const pendingOrderRaw = localStorage.getItem(PENDING_ORDER_KEY);

      if (!reference || !pendingOrderRaw) {
        setStatus('failed');
        setError('Missing payment details. Please try checking out again.');
        return;
      }

      try {
        const verifyRes = await verifyPaymentRequest(reference);

        if (!verifyRes.data.data.verified) {
          setStatus('failed');
          setError('Payment could not be verified.');
          return;
        }

        const pendingOrder = JSON.parse(pendingOrderRaw);
        const orderRes = await createOrderRequest({
          ...pendingOrder,
          paystackReference: reference,
        });

        localStorage.removeItem(PENDING_ORDER_KEY);
        clearCart();
        setStatus('success');
        navigate('/order-confirmation', { state: { order: orderRes.data.data.order }, replace: true });
      } catch (err) {
        setStatus('failed');
        setError(err.response?.data?.message || 'Failed to complete your order.');
      }
    };

    completeOrder();
  }, []);

  if (status === 'verifying') {
    return <p style={{ textAlign: 'center', padding: 'var(--space-12)' }}>Verifying your payment...</p>;
  }

  if (status === 'failed') {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return null; // brief moment before the redirect above fires
};

export default CheckoutVerify;