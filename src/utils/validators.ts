import { z } from 'zod'
import i18n from '@/i18n'

const isHi = () => i18n.language === 'hi'

const t = (en: string, hi: string) => isHi() ? hi : en

export const driverPersonalSchema = z.object({
  name: z
    .string()
    .min(2, () => t('Enter your full name', 'अपना पूरा नाम दर्ज करें'))
    .max(50, () => t('Name is too long', 'नाम बहुत लंबा है')),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, () => t('Enter a valid 10-digit mobile number', 'सही 10 अंकों का मोबाइल नंबर डालें')),
  email: z
    .string()
    .email(() => t('Enter a valid email address', 'सही ईमेल पता डालें'))
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().min(1, () => t('Select your date of birth', 'जन्म तिथि चुनें')),
  district: z.string().min(1, () => t('Select your district', 'जिला चुनें')),
  thana: z.string().min(1, () => t('Select your thana / area', 'थाना / क्षेत्र चुनें')),
  address: z.string().min(10, () => t('Enter your full address', 'पूरा पता दर्ज करें')),
})

export const driverDetailsSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], {
    errorMap: () => ({ message: t('Select your blood group', 'रक्त समूह चुनें') }),
  }),
  aadharNumber: z.string().regex(/^\d{12}$/, () => t('Enter your 12-digit Aadhaar number', '12 अंकों का आधार नंबर डालें')),
  licenseNumber: z.string().min(5, () => t('Enter your license number', 'लाइसेंस नंबर डालें')),
  licenseType: z.string().min(1, () => t('Select your license type', 'लाइसेंस प्रकार चुनें')),
  licenseExpiryDate: z.string().min(1, () => t('Select license expiry date', 'लाइसेंस की वैधता तिथि चुनें')),
})

export const documentUploadSchema = z.object({
  passportPhoto: z.instanceof(File, { message: t('Upload your passport photo', 'पासपोर्ट फोटो अपलोड करें') }),
  aadharCopy: z.instanceof(File, { message: t('Upload your Aadhaar card copy', 'आधार कार्ड की कॉपी अपलोड करें') }),
  licenseCopy: z.instanceof(File, { message: t('Upload your license copy', 'लाइसेंस की कॉपी अपलोड करें') }),
})

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const profileFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  designation: z.string().min(2),
})

export type DriverPersonalFormData = z.infer<typeof driverPersonalSchema>
export type DriverDetailsFormData = z.infer<typeof driverDetailsSchema>
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
export type ProfileFormData = z.infer<typeof profileFormSchema>

export type DriverRequestFormData = DriverPersonalFormData &
  DriverDetailsFormData &
  DocumentUploadFormData
