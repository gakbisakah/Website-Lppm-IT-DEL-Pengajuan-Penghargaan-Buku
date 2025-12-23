import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button" 

// 1. Root Component
const AlertDialog = AlertDialogPrimitive.Root

// 2. Trigger Component
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

// 3. Portal Component (Standard)
const AlertDialogPortal = AlertDialogPrimitive.Portal
// 4. Overlay Component (Abu-abu Gelap Solid, Tanpa Blur)
const AlertDialogOverlay = React.forwardRef<
React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
<AlertDialogPrimitive.Overlay
className={cn(
// Diubah dari bg-transparent/bg-black/X menjadi bg-black/70 dan hapus backdrop-blur-sm
"fixed inset-0 z-50 bg-black/70", // *** PERUBAHAN DI SINI ***
className
)}
{...props}
ref={ref}
/>
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

// ... (AlertDialogContent dan komponen lainnya tetap sama)
// 5. Content Component (TANPA ANIMASI, Langsung di Tengah)
const AlertDialogContent = React.forwardRef<
 React.ElementRef<typeof AlertDialogPrimitive.Content>,
 React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
 <AlertDialogPortal>
  <AlertDialogOverlay />
  <AlertDialogPrimitive.Content
   ref={ref}
   className={cn(
    // Properti Pusat (WAJIB)
    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
    // Properti Styling
    "gap-4 border border-border bg-card p-6 shadow-2xl sm:rounded-xl",
    className
   )}
   {...props}
  />
 </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

// 6. Header Component
const AlertDialogHeader = ({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
 <div
  className={cn(
   "flex flex-col space-y-2 text-center sm:text-left",
   className
  )}
  {...props}
 />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

// 7. Footer Component
const AlertDialogFooter = ({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
 <div
  className={cn(
   "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
   className
  )}
  {...props}
 />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

// 8. Title Component
const AlertDialogTitle = React.forwardRef<
 React.ElementRef<typeof AlertDialogPrimitive.Title>,
 React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
 <AlertDialogPrimitive.Title
  ref={ref}
  className={cn("text-xl font-bold text-foreground", className)}
  {...props}
 />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

// 9. Description Component
const AlertDialogDescription = React.forwardRef<
 React.ElementRef<typeof AlertDialogPrimitive.Description>,
 React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
 <AlertDialogPrimitive.Description
  ref={ref}
  className={cn("text-sm text-muted-foreground", className)}
  {...props}
 />
))
AlertDialogDescription.displayName =
 AlertDialogPrimitive.Description.displayName

// 10. Action/Cancel Buttons (Wrapper for Button Component)
const AlertDialogAction = React.forwardRef<
 React.ElementRef<typeof AlertDialogPrimitive.Action>,
 React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
 <AlertDialogPrimitive.Action
  ref={ref}
  className={cn(buttonVariants(), className)}
  {...props}
 />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
 React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
 React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
 <AlertDialogPrimitive.Cancel
  ref={ref}
  className={cn(
   buttonVariants({ variant: "outline" }),
   "mt-2 sm:mt-0",
   className
  )}
  {...props}
 />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
 AlertDialog,
 AlertDialogPortal,
 AlertDialogOverlay,
 AlertDialogTrigger,
 AlertDialogContent,
 AlertDialogHeader,
 AlertDialogFooter,
 AlertDialogTitle,
 AlertDialogDescription,
 AlertDialogAction,
 AlertDialogCancel,
}