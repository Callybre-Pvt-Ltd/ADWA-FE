import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Home, AlertTriangle, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdwaSeal } from '@/components/shared/AdwaSeal'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isHi = i18n?.language === 'hi'

  const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  const isChunkError =
    errorMessage.includes('dynamically imported module') ||
    errorMessage.includes('Loading chunk') ||
    errorMessage.includes('Failed to fetch')

  const is404 = isRouteErrorResponse(error) && error.status === 404

  const handleReload = () => {
    // Clear any reload flags and hard reload
    sessionStorage.removeItem('vite_preload_error')
    window.location.reload()
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200/80 shadow-xl p-8 flex flex-col items-center">
        <div className="mb-4">
          <AdwaSeal size="md" />
        </div>

        {isChunkError ? (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <RefreshCw className="h-7 w-7 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-blue-900">
              {isHi ? 'नया संस्करण उपलब्ध है' : 'App Update Available'}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              {isHi
                ? 'सिस्टम को अपडेट कर दिया गया है। नवीनतम बदलाव लोड करने के लिए कृपया पेज को रीफ्रेश करें।'
                : 'A new version of the application has been deployed. Please reload the page to continue.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={handleReload}
                className="flex-1 bg-blue-900 hover:bg-blue-800 font-bold gap-2 cursor-pointer h-11"
              >
                <RefreshCw className="h-4 w-4" />
                {isHi ? 'पेज रीफ्रेश करें' : 'Reload Page'}
              </Button>
            </div>
          </>
        ) : is404 ? (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-900">
              <FileQuestion className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-blue-900">
              {isHi ? 'पृष्ठ नहीं मिला (404)' : 'Page Not Found (404)'}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              {isHi
                ? 'जिस पेज को आप ढूंढ रहे हैं वह मौजूद नहीं है या हटा दिया गया है।'
                : 'The page you are looking for does not exist or has been moved.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-900 hover:bg-blue-800 font-bold gap-2 cursor-pointer h-11"
              >
                <Home className="h-4 w-4" />
                {isHi ? 'मुख्य पृष्ठ पर जाएं' : 'Go to Home'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-neutral-900">
              {isHi ? 'कुछ गलत हो गया' : 'Something went wrong'}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              {isHi
                ? 'अनपेक्षित त्रुटि आई है। कृपया पुनः प्रयास करें।'
                : 'An unexpected error occurred. Please try reloading or returning to the homepage.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1 font-bold gap-2 cursor-pointer h-11"
              >
                <Home className="h-4 w-4" />
                {isHi ? 'होम' : 'Home'}
              </Button>
              <Button
                onClick={handleReload}
                className="flex-1 bg-blue-900 hover:bg-blue-800 font-bold gap-2 cursor-pointer h-11"
              >
                <RefreshCw className="h-4 w-4" />
                {isHi ? 'पुनः प्रयास करें' : 'Try Again'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
