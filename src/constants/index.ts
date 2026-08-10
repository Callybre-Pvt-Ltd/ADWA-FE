export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const LICENSE_TYPES = [
  'LMV',
  'HMV',
  'Transport Vehicle',
  'Motorcycle',
  'Auto Rickshaw',
] as const

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

export const VEHICLE_TYPES = [
  'Auto Rickshaw', 'Taxi / Cab', 'Bus', 'Truck / Lorry', 'Mini Truck',
  'Ambulance', 'School Bus', 'Tourist Vehicle', 'Goods Vehicle', 'Other',
]

export const DRIVER_CATEGORIES = [
  'Light Motor Vehicle (LMV)',
  'Heavy Motor Vehicle (HMV)',
  'Transport Vehicle',
  'Hazardous Goods Vehicle',
  'Passenger Goods Vehicle',
]

export const EMPLOYMENT_TYPES = [
  'Self Employed', 'Private Company', 'Government', 'Contractual', 'Other',
]

export const EXPERIENCE_OPTIONS = [
  '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10-15 years', '15+ years',
]

export const API_DELAY = 800

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/share/18uRHiSyQX/',
  twitter: '',
  instagram: '',
  youtube: 'https://youtube.com/@driverkasanghrshsw358',
  whatsapp: 'https://wa.me/919407240690',
}

export const CONTACT_INFO = {
  phone: '+91 95890 74870',
  phoneTel: '+919589074870',
  supportPhone: '+91 95890 74870',
  whatsapp: '+91 94072 40690',
  whatsappTel: '+919407240690',
  email: 'alldriverwelfareassociation.mp@gmail.com',
  address:
    'House No. 08, Bhouri, Tehsil Huzur, District Bhopal, Madhya Pradesh – 462030',
  addressHi: 'मकान नं. 08, भौरी, तहसील हुजूर, जिला भोपाल, मध्य प्रदेश – 462030',
  registryNumber: '01/01/01/43116/26',
  foundedOn: '2 June 2026',
  foundedOnHi: '2 जून 2026',
  state: 'Madhya Pradesh',
  stateHi: 'मध्य प्रदेश',
  districtsCovered: '55 districts of Madhya Pradesh',
  districtsCoveredHi: 'मध्य प्रदेश के 55 जिले',
}

/** Membership fee payment details (shown on district forward + public apply help). */
export const PAYMENT_INFO = {
  accountHolder: 'KASHIRAM SEN',
  bankName: 'State Bank of India',
  accountNumber: '45391987346',
  accountNumberMasked: '****7346',
  ifsc: 'SBIN0000519',
  branch: 'H E Township (Bhopal), Piplani',
  upiId: '9131534674@sbi',
  /** UPI QR for scanning (exact payment screenshot asset). */
  upiQrSrc: '/payment/upi-qr.png?v=2',
} as const
