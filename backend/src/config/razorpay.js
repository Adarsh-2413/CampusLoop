import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

if (keyId && keySecret) {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
  console.log('✅ Razorpay Test Client Initialized');
} else {
  console.warn('\n================================================================');
  console.warn('⚠️  RAZORPAY_KEY_ID and/or RAZORPAY_KEY_SECRET are not set in backend/.env');
  console.warn('   Razorpay payments will run in simulation mode for local testing.');
  console.warn('   To enable real Razorpay test transactions, add your Test Mode keys:');
  console.warn('   RAZORPAY_KEY_ID=rzp_test_...\n   RAZORPAY_KEY_SECRET=...\n   RAZORPAY_WEBHOOK_SECRET=...');
  console.warn('================================================================\n');
}

export const getRazorpay = () => razorpayInstance;
export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated_key';
export const getRazorpayKeySecret = () => process.env.RAZORPAY_KEY_SECRET || 'dev_secret_for_simulated_razorpay';
export const getRazorpayWebhookSecret = () => process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_webhook_secret_for_razorpay';
