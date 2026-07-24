import { Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { AuthProvider } from '@/context/AuthContext'
import { PublicLayout } from '@/layouts/PublicLayout'
import { DistrictLayout } from '@/layouts/DistrictLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { publicRoutes, districtRoutes, adminRoutes } from '@/routes/routes.data'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Toaster } from '@/components/ui/sonner'
import DistrictLoginPage from '@/pages/auth/DistrictLoginPage'
import AdminLoginPage from '@/pages/auth/AdminLoginPage'
import i18n from '@/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

function PageLoader() {
  return (
    <div className="container-wide py-8">
      <SkeletonCard />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/dashboard', element: <Navigate to="/services" replace /> },
      { path: '/payment', element: <Navigate to="/services" replace /> },
      { path: '/download', element: <Navigate to="/services" replace /> },
      ...publicRoutes.map((route) => ({
        path: route.path,
        element: (
          <Suspense fallback={<PageLoader />}>
            <route.component />
          </Suspense>
        ),
      })),
    ],
  },
  {
    path: '/district/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <DistrictLoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  {
    element: <DistrictLayout />,
    children: [
      { path: '/district/dashboard', element: <Navigate to="/district/requests" replace /> },
      ...districtRoutes.map((route) => ({
        path: route.path,
        element: (
          <Suspense fallback={<PageLoader />}>
            <route.component />
          </Suspense>
        ),
      })),
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin/dashboard', element: <Navigate to="/admin/applications" replace /> },
      ...adminRoutes.map((route) => ({
        path: route.path,
        element: (
          <Suspense fallback={<PageLoader />}>
            <route.component />
          </Suspense>
        ),
      })),
    ],
  },
])

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  )
}
