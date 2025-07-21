import { z } from 'zod';

// Card number validation (16 digits)
const cardNumberRegex = /^\d{16}$/;

// Expiry date validation (MM/YY format)
const expiryDateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;

// CVV validation (3 or 4 digits)
const cvvRegex = /^\d{3,4}$/;


export const saveCardValidation = z.object({
  cardNumber: z.string()
    .regex(cardNumberRegex, 'Card number must be 16 digits'),
  expiryDate: z.string()
    .regex(expiryDateRegex, 'Expiry date must be in MM/YY format')
    .refine((val) => {
      const [month, year] = val.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      return expiry > new Date();
    }, { message: 'Card has expired' }),
  cvv: z.string()
    .regex(cvvRegex, 'CVV must be 3 or 4 digits'),
  nameOnCard: z.string()
    .min(1, 'Name on card is required')
    .max(100, 'Name on card cannot exceed 100 characters'),
  isDefault: z.boolean().optional()
});

export const saveCardUpdateValidation = z.object({
  expiryDate: z.string()
    .regex(expiryDateRegex, 'Expiry date must be in MM/YY format')
    .refine((val) => {
      const [month, year] = val.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      return expiry > new Date();
    }, { message: 'Card has expired' })
    .optional(),
  nameOnCard: z.string()
    .min(1, 'Name on card is required')
    .max(100, 'Name on card cannot exceed 100 characters')
    .optional(),
  isDefault: z.boolean().optional()
});