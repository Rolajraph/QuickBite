import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import { createOrderRequest } from '../../api/orderApi';
import { initializePaymentRequest } from '../../api/orderApi';
import { formatCurrency } from '../../utils/formatCurrency';
import useAuth from '../../hooks/useAuth';
import '../../styles/forms.css';
import './Checkout.css';

const PENDING_ORDER_KEY = 'pendingOrder';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deliveryAddress: '',
    phone: '',
    paymentMethod: 'cash_on_delivery',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const orderPayload = {
      items: items.map(({ food, quantity }) => ({ food: food._id, quantity })),
      deliveryAddress: formData.deliveryAddress,
      phone: formData.phone,
      paymentMethod: formData.paymentMethod,
    };

    try {
      if (formData.paymentMethod === 'card') {
        // Save the order details so /checkout/verify can complete it after payment
        localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(orderPayload));

        const response = await initializePaymentRequest({
          amount: subtotal,
          email: user.email,
        });

        window.location.href = response.data.data.authorizationUrl;
        return; // browser is navigating away, nothing more to do here
      }

      // Cash on Delivery / Bank Transfer — create the order immediately
      const response = await createOrderRequest(orderPayload);
      const order = response.data.data.order;
      clearCart();
      navigate('/order-confirmation', { state: { order } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <p>Your cart is empty. Add items before checking out.</p>;
  }

  return (
    <div className="checkout-page">
      <h1 className="brush-underline">Checkout</h1>

      <div className="checkout-summary">
        <h2>Order Summary</h2>
        {items.map(({ food, quantity }) => (
          <div className="checkout-summary__line" key={food._id}>
            <span>{food.name} × {quantity}</span>
            <span>{formatCurrency(food.price * quantity)}</span>
          </div>
        ))}
        <div className="checkout-summary__total">
          <span>Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-field">
          <label htmlFor="deliveryAddress">Delivery Address</label>
          <input
            id="deliveryAddress"
            name="deliveryAddress"
            type="text"
            value={formData.deliveryAddress}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="paymentMethod">Payment Method</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="cash_on_delivery">Cash on Delivery</option>
            <option value="card">Card (Paystack)</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="form-submit-btn">
          {isSubmitting ? 'Processing...' : formData.paymentMethod === 'card' ? 'Pay with Card' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;