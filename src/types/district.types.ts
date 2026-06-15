export type District = {
  id: string
  name: string
  state: string
  thanas: string[]
  inchargeName: string
  inchargeEmail: string
  inchargeMobile: string
  driverCount: number
  activeRequests: number
  status: 'active' | 'inactive'
}

export type CreateDistrictDto = Omit<District, 'id' | 'driverCount' | 'activeRequests'>
