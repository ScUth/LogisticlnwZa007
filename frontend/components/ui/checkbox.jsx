"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

const Checkbox = CheckboxPrimitive.Root

const CheckboxIndicator = CheckboxPrimitive.Indicator

export { Checkbox, CheckboxIndicator }

export function StyledCheckbox({ className, ...props }) {
  return (
    <Checkbox
    // simple first
      className={`data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 data-[state=unchecked]:border-gray-300 border rounded w-5 h-5 flex items-center justify-center ${className}`}
      {...props}
    >
      <CheckboxIndicator>
        <Check className="text-gray-50 h-4 w-4" />
      </CheckboxIndicator>
    </Checkbox>
  )
} 
