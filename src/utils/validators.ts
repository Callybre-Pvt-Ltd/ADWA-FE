import { z } from 'zod'
import i18n from '@/i18n'

const isHi = () => i18n.language === 'hi'

const t = (en: string, hi: string) => isHi() ? hi : en

const msg = (en: string, hi: string) => ({ error: () => t(en, hi) })

const mobileRegex = /^[6-9]\d{9}$/

export const driverPersonalSchema = z.object({
  name: z
    .string()
    .min(2, msg('Enter your full name', 'अपना पूरा नाम दर्ज करें'))
    .max(50, msg('Name is too long', 'नाम बहुत लंबा है')),
  fatherName: z
    .string()
    .min(2, msg("Enter father's name", 'पिता का नाम दर्ज करें')),
  motherName: z
    .string()
    .min(2, msg("Enter mother's name", 'माता का नाम दर्ज करें')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    error: () => t('Select your gender', 'लिंग चुनें'),
  }),
  mobile: z
    .string()
    .regex(mobileRegex, msg('Enter a valid 10-digit mobile number', 'सही 10 अंकों का मोबाइल नंबर डालें')),
  altMobile: z
    .string()
    .regex(mobileRegex, msg('Enter a valid 10-digit mobile number', 'सही 10 अंकों का मोबाइल नंबर डालें'))
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email(msg('Enter a valid email address', 'सही ईमेल पता डालें'))
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().min(1, msg('Select your date of birth', 'जन्म तिथि चुनें')),
  districtId: z.string().min(1, msg('Select your district', 'जिला चुनें')),
  district: z.string().optional(),
  tehsil: z.string().min(1, msg('Enter tehsil', 'तहसील दर्ज करें')),
  village: z.string().min(1, msg('Enter village / town', 'गाँव / शहर दर्ज करें')),
  state: z.literal('Madhya Pradesh').default('Madhya Pradesh'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, msg('Enter a valid 6-digit pincode', 'सही 6 अंकों का पिनकोड डालें')),
  address: z.string().min(10, msg('Enter your full address', 'पूरा पता दर्ज करें')),
})

export const driverDetailsSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], {
    error: () => t('Select your blood group', 'रक्त समूह चुनें'),
  }),
  aadharNumber: z.string().regex(/^\d{12}$/, msg('Enter your 12-digit Aadhaar number', '12 अंकों का आधार नंबर डालें')),
  licenseNumber: z.string().min(5, msg('Enter your license number', 'लाइसेंस नंबर डालें')),
  licenseIssueDate: z.string().min(1, msg('Select license issue date', 'लाइसेंस जारी तिथि चुनें')),
  licenseExpiryDate: z.string().min(1, msg('Select license expiry date', 'लाइसेंस की वैधता तिथि चुनें')),
  vehicleType: z.string().min(1, msg('Select vehicle type', 'वाहन प्रकार चुनें')),
  vehicleNumber: z.string().min(4, msg('Enter vehicle number', 'वाहन नंबर दर्ज करें')),
  experienceYears: z.coerce
    .number()
    .min(0, msg('Enter driving experience', 'अनुभव दर्ज करें'))
    .max(60, msg('Experience value is too high', 'अनुभव बहुत अधिक है')),
})

const optionalFile = z.instanceof(File).optional()

export const documentUploadSchema = z.object({
  driverPhoto: optionalFile,
  aadhaarFront: optionalFile,
  aadhaarBack: optionalFile,
  licenseFront: optionalFile,
  licenseBack: optionalFile,
  vehicleRc: optionalFile,
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
  mobile: z.string().regex(mobileRegex),
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

export function buildDriverRequestFormData(data: DriverRequestFormData): FormData {
  const formData = new FormData()
  formData.append('district_id', data.districtId)
  formData.append('full_name', data.name)
  formData.append('father_name', data.fatherName)
  formData.append('mother_name', data.motherName)
  formData.append('date_of_birth', data.dateOfBirth)
  formData.append('gender', data.gender)
  formData.append('mobile_number', data.mobile)
  if (data.altMobile) formData.append('alt_mobile_number', data.altMobile)
  if (data.email) formData.append('email', data.email)
  formData.append('blood_group', data.bloodGroup)
  formData.append('address', data.address)
  formData.append('village', data.village)
  formData.append('tehsil', data.tehsil)
  formData.append('state', data.state)
  formData.append('pincode', data.pincode)
  formData.append('license_number', data.licenseNumber)
  formData.append('license_issue_date', data.licenseIssueDate)
  formData.append('license_expiry_date', data.licenseExpiryDate)
  formData.append('vehicle_type', data.vehicleType)
  formData.append('vehicle_number', data.vehicleNumber)
  formData.append('experience_years', String(data.experienceYears))
  formData.append('aadhaar_number', data.aadharNumber)
  if (data.driverPhoto) formData.append('driver_photo', data.driverPhoto)
  if (data.aadhaarFront) formData.append('aadhaar_front', data.aadhaarFront)
  if (data.aadhaarBack) formData.append('aadhaar_back', data.aadhaarBack)
  if (data.licenseFront) formData.append('license_front', data.licenseFront)
  if (data.licenseBack) formData.append('license_back', data.licenseBack)
  if (data.vehicleRc) formData.append('vehicle_rc', data.vehicleRc)
  return formData
}
