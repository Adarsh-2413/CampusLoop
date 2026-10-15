import crypto from 'crypto';

/**
 * Verify Razorpay Standard Checkout payment signature
 * payload: razorpayOrderId + "|" + razorpayPaymentId
 * algorithm: HMAC-SHA256 with key_secret
 */
export const verifyPaymentSignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  secret
}) => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !secret) {
    return false;
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Timing safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(razorpaySignature, 'utf-8')
    );
  } catch (err) {
    return false;
  }
};

/**
 * Verify Razorpay Webhook signature using raw request body buffer
 */
export const verifyWebhookSignature = ({ rawBody, signature, secret }) => {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (err) {
    return false;
  }
};
