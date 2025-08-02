
// components/ui/alert.jsx
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Info, AlertCircle, CheckCircle, XCircle } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-600 dark:text-green-500 [&>svg]:text-green-600 dark:border-green-500/50",
        warning:
          "border-yellow-500/50 text-yellow-600 dark:text-yellow-500 [&>svg]:text-yellow-600 dark:border-yellow-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

function AlertIcon({ variant }) {
  const icons = {
    default: Info,
    destructive: AlertCircle,
    success: CheckCircle,
    warning: XCircle,
  }
  
  const Icon = icons[variant || "default"]
  return <Icon className="h-4 w-4" />
}

const AlertRoot = React.forwardRef(
  ({ children, className, variant, ...props }, ref) => (
    <Alert ref={ref} variant={variant} className={cn(className)} {...props}>
      <AlertIcon variant={variant} />
      {children}
    </Alert>
  )
)
AlertRoot.displayName = "AlertRoot"

export { Alert, AlertTitle, AlertDescription, AlertRoot }
