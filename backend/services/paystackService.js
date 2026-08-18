const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackFetch = async (path, options = {}) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || 'Paystack request failed');
  }

  return data.data;
};

export const initializeTransaction = async ({ email, amountInKobo, metadata, callbackUrl }) => {
  return paystackFetch('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email,
      amount: amountInKobo,
      metadata,
      callback_url: callbackUrl,
    }),
  });
};

export const verifyTransaction = async (reference) => {
  return paystackFetch(`/transaction/verify/${reference}`, {
    method: 'GET',
  });
};