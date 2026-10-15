/**
 * College Email Domain Validation Utility
 * Validates student emails against COLLEGE_EMAIL_DOMAINS env var.
 */

export const validateCollegeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Invalid email address.' };
  }

  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, message: 'Malformed email format.' };
  }

  const domain = parts[1];

  // Configured domains from environment variable
  const envDomains = process.env.COLLEGE_EMAIL_DOMAINS
    ? process.env.COLLEGE_EMAIL_DOMAINS.split(',').map((d) => d.trim().toLowerCase())
    : [];

  if (envDomains.length > 0) {
    const isMatched = envDomains.some((d) => domain === d || domain.endsWith('.' + d));
    if (!isMatched) {
      return {
        valid: false,
        message: `Email domain "@${domain}" is not in the allowed campus domain list (${envDomains.join(', ')}).`
      };
    }
    return { valid: true, domain };
  }

  // Default fallback: allow any .edu or .ac.in domain
  if (domain.endsWith('.edu') || domain.endsWith('.ac.in') || domain.includes('.edu.') || domain.includes('.ac.')) {
    return { valid: true, domain };
  }

  return {
    valid: false,
    message: 'Registration requires an active college student email (.edu or .ac.in).'
  };
};
