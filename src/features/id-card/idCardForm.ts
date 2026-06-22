import type { CardSnapshot } from '@/services/api/cards.service'

export type IdCardFormValues = {
  fullName: string
  fatherName: string
  designation: string
  mobileNumber: string
  licenseNumber: string
  policeStation: string
  city: string
  state: string
  bloodGroup: string
  dateOfBirth: string
}

export function snapshotToForm(snapshot: CardSnapshot): IdCardFormValues {
  return {
    fullName: snapshot.fullName ?? '',
    fatherName: snapshot.fatherName ?? '',
    designation: snapshot.designation ?? 'MEMBER',
    mobileNumber: snapshot.mobileNumber ?? '',
    licenseNumber: snapshot.licenseNumber ?? '',
    policeStation: snapshot.policeStation ?? '',
    city: snapshot.city ?? '',
    state: snapshot.state ?? '',
    bloodGroup: snapshot.bloodGroup ?? '',
    dateOfBirth: snapshot.dateOfBirth ?? '',
  }
}

export function formToPayload(values: IdCardFormValues) {
  return {
    full_name: values.fullName || undefined,
    father_name: values.fatherName || undefined,
    designation: values.designation || undefined,
    mobile_number: values.mobileNumber || undefined,
    license_number: values.licenseNumber || undefined,
    police_station: values.policeStation || undefined,
    city: values.city || undefined,
    state: values.state || undefined,
    blood_group: values.bloodGroup || undefined,
    date_of_birth: values.dateOfBirth || undefined,
  }
}
