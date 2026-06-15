import type { TeamMember, Statistic, Testimonial } from '../types/common.types'

export const mockTeam: TeamMember[] = [
  { id: '1', name: 'Surendra Prasad', role: 'National President', email: 'president@adwa.org', phone: '+91 73192 22335', bio: 'Leading ADWA for 12+ years.' },
  { id: '2', name: 'Prakash Kumar Singh', role: 'Vice President', email: 'vp@adwa.org', bio: 'Driving welfare initiatives across states.' },
  { id: '3', name: 'Awtar Singh', role: 'General Secretary', email: 'gs@adwa.org', bio: 'Manages national operations.' },
  { id: '4', name: 'Ramesh Yadav', role: 'Joint Secretary', email: 'js@adwa.org', bio: 'Oversees member registrations.' },
  { id: '5', name: 'Meera Devi', role: 'Treasurer', email: 'treasurer@adwa.org', bio: 'Manages financial operations.' },
  { id: '6', name: 'Ajay Sharma', role: 'Welfare Director', email: 'welfare@adwa.org', bio: 'Leads emergency assistance programs.' },
  { id: '7', name: 'Vinod Kumar', role: 'Operations Head', email: 'ops@adwa.org', bio: 'Streamlines day-to-day operations.' },
  { id: '8', name: 'Sunita Rathore', role: 'State Coordinator', email: 'state@adwa.org', bio: 'Coordinates district offices.' },
  { id: '9', name: 'Ankit Mishra', role: 'Digital Director', email: 'digital@adwa.org', bio: 'Spearheading digital transformation.' },
]

export const mockStatistics: Statistic[] = [
  { id: 'cards', label: 'ID Cards Issued', value: 124000, suffix: '+', icon: 'credit-card' },
  { id: 'districts', label: 'Districts Covered', value: 38, icon: 'map-pin' },
  { id: 'active', label: 'Active IDs', value: 98500, suffix: '+', icon: 'users' },
  { id: 'days', label: 'Avg. Issue Time', value: 12, suffix: ' Days', icon: 'globe' },
]

export const mockTestimonials: Testimonial[] = [
  { id: '1', name: 'Rajesh Kumar', role: 'Truck Driver', state: 'Uttar Pradesh', content: 'Getting my ADWA ID card was very simple. I received my card in just 15 days.', rating: 5, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RK&backgroundColor=1E1B4B&textColor=ffffff' },
  { id: '2', name: 'Suresh Patel', role: 'Auto Rickshaw Driver', state: 'Gujarat', content: 'ADWA ne meri bahut madad ki jab mujhe accident hua. Welfare benefits se hospital bills cover hue.', rating: 5, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SP2&backgroundColor=059669&textColor=ffffff' },
  { id: '3', name: 'Mohammed Irfan', role: 'Cab Driver', state: 'Maharashtra', content: 'The digital ID card download feature is excellent. I can show it on my phone anytime.', rating: 5, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MI&backgroundColor=D97706&textColor=ffffff' },
  { id: '4', name: 'Gurpreet Singh', role: 'Bus Driver', state: 'Punjab', content: 'ADWA ID card bahut important hai mere liye. Bahut professional document hai.', rating: 4, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GS&backgroundColor=1E1B4B&textColor=ffffff' },
  { id: '5', name: 'Anita Devi', role: 'Taxi Driver', state: 'Delhi', content: 'As a woman driver, having ADWA membership has given me confidence.', rating: 5, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AD&backgroundColor=059669&textColor=ffffff' },
]

export const mockMonthlyRegistrations = [
  { label: 'Jan', value: 120 },
  { label: 'Feb', value: 145 },
  { label: 'Mar', value: 132 },
  { label: 'Apr', value: 168 },
  { label: 'May', value: 190 },
  { label: 'Jun', value: 175 },
  { label: 'Jul', value: 210 },
  { label: 'Aug', value: 198 },
  { label: 'Sep', value: 225 },
  { label: 'Oct', value: 240 },
  { label: 'Nov', value: 215 },
  { label: 'Dec', value: 260 },
]

export const mockDistrictRegistrations = [
  { label: 'Lucknow', value: 4520 },
  { label: 'Ahmedabad', value: 3890 },
  { label: 'Mumbai', value: 6200 },
  { label: 'Delhi', value: 5100 },
  { label: 'Jaipur', value: 2750 },
]

export const mockPaymentBreakdown = [
  { label: 'Confirmed', value: 45 },
  { label: 'Waiting', value: 12 },
  { label: 'Collected', value: 8 },
  { label: 'Pending', value: 15 },
]

export const mockActivities = [
  { id: 'a1', message: 'New driver application from Mohammed Irfan', timestamp: '2025-02-01T09:00:00Z', type: 'info' as const },
  { id: 'a2', message: 'Payment confirmed for Suresh Patel', timestamp: '2025-01-15T09:00:00Z', type: 'success' as const },
  { id: 'a3', message: 'ID card generated for Rajesh Kumar', timestamp: '2024-06-01T12:00:00Z', type: 'success' as const },
  { id: 'a4', message: '5 renewals pending in Lucknow district', timestamp: '2025-02-06T08:00:00Z', type: 'warning' as const },
]
