"use client"

import { useEffect } from "react"
import { CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SuccessNotificationProps {
  isVisible: boolean
  message: string
  onClose: () => void
  type?: "success" | "draft"
}

export function SuccessNotification({ isVisible, message, onClose, type = "success" }: SuccessNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md",
          type === "success"
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
            : "bg-orange-50/90 border-orange-200 text-orange-800",
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            type === "success" ? "theme-green" : "theme-orange",
          )}
        >
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-current hover:bg-white/20 rounded-lg">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
