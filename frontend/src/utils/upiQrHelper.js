/**
 * UPI QR Code and Deep Link Utility for CampusLoop
 * Generates valid NPCI-compliant UPI payment links and scannable QR images.
 */

/**
 * Creates a standard NPCI UPI payment deep link URI
 * @param {Object} params
 * @param {string} params.upiId - Seller's UPI ID / VPA (e.g. rohan.sharma@okaxis)
 * @param {string} params.name - Seller's name
 * @param {number} params.amount - Total amount in INR
 * @param {string} [params.orderNumber] - Order reference number
 * @returns {string} upi://pay URI
 */
export const generateUpiUri = ({ upiId, name, amount, orderNumber = '' }) => {
  const cleanUpi = (upiId || 'campusloop.seller@okaxis').trim();
  const cleanName = encodeURIComponent(name || 'Campus Student Seller');
  const cleanNote = encodeURIComponent(`CampusLoop Order ${orderNumber || 'Handover'}`);
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${amount}&cu=INR&tn=${cleanNote}`;
};

/**
 * Returns a scannable QR code image URL for a given UPI payment payload
 * @param {Object} params
 * @returns {string} Image URL for the QR code
 */
export const getUpiQrCodeUrl = ({ upiId, name, amount, orderNumber = '' }) => {
  const upiUri = generateUpiUri({ upiId, name, amount, orderNumber });
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(upiUri)}`;
};

/**
 * Sample QR Code image presets for offline/demo seller setup
 */
export const DEFAULT_SELLER_UPI = {
  upiId: 'rohan.sharma@okaxis',
  qrImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80'
};
