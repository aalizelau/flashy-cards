import * as React from "react"

import { cn } from "@/shared/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-accent transition-all duration-200 h-12 bg-white text-base placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 text-md file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
