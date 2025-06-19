import { toast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

// Success Toast
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    variant: "success",
    title: (
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        {title}
      </div>
    ),
    description,
    duration: 5000,
  })
}

// Error Toast
export const showErrorToast = (title: string, description?: string) => {
  toast({
    variant: "destructive",
    title: (
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-600" />
        {title}
      </div>
    ),
    description,
    duration: 7000,
  })
}

// Info Toast
export const showInfoToast = (title: string, description?: string) => {
  toast({
    variant: "info",
    title: (
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600" />
        {title}
      </div>
    ),
    description,
    duration: 5000,
  })
}

// Warning Toast
export const showWarningToast = (title: string, description?: string) => {
  toast({
    variant: "warning",
    title: (
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        {title}
      </div>
    ),
    description,
    duration: 6000,
  })
}
