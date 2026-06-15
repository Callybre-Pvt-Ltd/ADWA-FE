import {
  type LucideIcon,
  Home, Info, History, BookOpen, Scale, Users, Calendar, Bell,
  FileText, QrCode, Mail, LayoutDashboard, ClipboardList, RefreshCw,
  CreditCard, BadgeCheck, User, MapPin, ScrollText, LayoutGrid,
  CheckCircle, Download, Headphones,
} from 'lucide-react'

export const iconMap: Record<string, LucideIcon> = {
  Home, Info, History, BookOpen, Scale, Users, Calendar, Bell,
  FileText, QrCode, Mail, LayoutDashboard, ClipboardList, RefreshCw,
  CreditCard, BadgeCheck, User, MapPin, ScrollText, LayoutGrid,
  CheckCircle, Download, Headphones,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Home
}
