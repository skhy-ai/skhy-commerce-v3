import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    companyName: z.string().min(2, 'Company name is required'),
    sellerType: z.enum(['manufacturer', 'distributor', 'reseller', 'integrator', 'seller']),
});

export const CheckoutAddressSchema = z.object({
    name: z.string().min(2, 'Full name is required'),
    line1: z.string().min(5, 'Address Line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Province is required'),
    postal_code: z.string().min(3, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
    phone: z.string().regex(/^\+?[\d\s-]{8,15}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
});

export const OnboardingProfileSchema = z.object({
    company_name: z.string().min(2, 'Company name is required'),
    website: z.string().url('Please enter a valid URL (include http:// or https://)').optional().or(z.literal('')),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    contact_email: z.string().email('Invalid contact email'),
    contact_phone: z.string().min(5, 'Contact phone is required'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type CheckoutAddressData = z.infer<typeof CheckoutAddressSchema>;
export type OnboardingProfileData = z.infer<typeof OnboardingProfileSchema>;
