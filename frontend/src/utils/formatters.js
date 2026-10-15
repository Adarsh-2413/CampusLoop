/**
 * Utility formatters for CampusLoop
 */

export const formatINR = (amount, isPaise = false) => {
  const value = isPaise ? amount / 100 : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const getConditionStyle = (condition) => {
  switch (condition) {
    case 'New':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'Like New':
      return {
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500'
      };
    case 'Good':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'Fair':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400'
      };
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Checks if the current authenticated user is the seller of the product.
 * Avoids any JavaScript undefined === undefined false positives.
 */
export const isUserOwnProduct = (user, product) => {
  if (!user || !product) return false;
  // If user is a Buyer, they never own the product
  if (user.role === 'BUYER') return false;

  const userId = user._id || user.id;
  if (!userId) return false;

  const sellerId = product.sellerId || product.seller?._id || product.seller?.id;
  if (!sellerId) return false;

  return String(userId) === String(sellerId);
};

