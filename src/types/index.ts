export interface LeadershipMember {
  id: number
  name: string
  designation: string
  image: string
  bio: string
}

export interface Statistic {
  id: string
  label: string
  value: number
  suffix: string
  icon: string
}

export interface Service {
  id: string
  icon: string
  title: string
  description: string
  eligibility: string
  process: string[]
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  state: string
  content: string
  rating: number
  avatar: string
}

export interface DownloadItem {
  id: string
  title: string
  description: string
  type: string
  size: string
  icon: string
}

export interface ApplicationStatus {
  referenceNumber: string
  fullName: string
  submittedAt: string
  currentStep: number
  steps: TrackingStep[]
}

export interface TrackingStep {
  id: number
  label: string
  description: string
  completedAt: string | null
  status: 'completed' | 'active' | 'pending'
}

export interface RenewalRecord {
  membershipNumber: string
  fullName: string
  dateOfBirth: string
  phone: string
  email: string
  address: string
  expiryDate: string
  status: string
}

export interface ApplicationFormData {
  fullName: string
  fatherName: string
  dateOfBirth: string
  gender: string
  mobile: string
  alternateMobile: string
  email: string
  aadhaarNumber: string
  licenseNumber: string
  bloodGroup: string
  address: string
  village: string
  city: string
  district: string
  state: string
  pincode: string
  vehicleType: string
  experience: string
  driverCategory: string
  employmentType: string
  rtoCode: string
  passportPhoto: File | null
  signature: File | null
  aadhaarFront: File | null
  aadhaarBack: File | null
  licenseFront: File | null
  licenseBack: File | null
}

export interface ContactFormData {
  name: string
  mobile: string
  email: string
  subject: string
  message: string
}
