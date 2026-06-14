import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { ApplyPage } from '@/pages/ApplyPage'
import { TrackPage } from '@/pages/TrackPage'
import { RenewalPage } from '@/pages/RenewalPage'
import { DownloadsPage } from '@/pages/DownloadsPage'
import { RulesPage } from '@/pages/RulesPage'
import { ContactPage } from '@/pages/ContactPage'
import { ROUTES } from '@/constants'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.ABOUT, element: <AboutPage /> },
      { path: ROUTES.SERVICES, element: <ServicesPage /> },
      { path: ROUTES.APPLY, element: <ApplyPage /> },
      { path: ROUTES.TRACK, element: <TrackPage /> },
      { path: ROUTES.RENEWAL, element: <RenewalPage /> },
      { path: ROUTES.DOWNLOADS, element: <DownloadsPage /> },
      { path: ROUTES.RULES, element: <RulesPage /> },
      { path: ROUTES.CONTACT, element: <ContactPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
