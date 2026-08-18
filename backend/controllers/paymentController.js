import * as paystackService from '../services/paystackService.js';
import ApiError from '../utils/ApiError.js';

export const initializePayment = async (req, res) => {
  const { amount, email } = req.body;

  if (!amount || !email) {
    throw new ApiError(400, 'Amount and email are required');
  }

  const amountInKobo = Math.round(amount * 100);

  const transaction = await paystackService.initializeTransaction({
    email,
    amountInKobo,
    metadata: { userId: req.user.id },
    callbackUrl: `${process.env.CLIENT_URL}/checkout/verify`,
  });

  res.status(200).json({
    success: true,
    data: {
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    },
  });
};

export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  const transaction = await paystackService.verifyTransaction(reference);

  const isSuccessful = transaction.status === 'success';

  res.status(200).json({
    success: true,
    data: {
      verified: isSuccessful,
      amount: transaction.amount / 100, // convert back from kobo
      reference: transaction.reference,
    },
  });
};