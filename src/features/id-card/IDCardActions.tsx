import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface IDCardActionsProps {
  onPrint?: () => void
  onDownload?: () => void
  loading?: boolean
}

export default function IDCardActions({ onPrint, onDownload, loading }: IDCardActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={onPrint} loading={loading} loadingText="Preparing…">
        <Printer className="h-4 w-4" /> Print
      </Button>
      <Button onClick={onDownload} loading={loading} loadingText="Preparing…">
        <Download className="h-4 w-4" /> Download
      </Button>
    </div>
  )
}
