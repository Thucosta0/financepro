import * as React from "react"
import { cn } from "@/lib/utils"
import { AtSign } from 'lucide-react'

export interface UsernameInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const UsernameInput = React.forwardRef<HTMLInputElement, UsernameInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none">
          <AtSign className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
UsernameInput.displayName = "UsernameInput"

export { UsernameInput } 