"use client"

import React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value
export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`inline-flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = "SelectTrigger"

export const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg z-50 min-w-[var(--radix-select-trigger-width)] ${className}`}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className="py-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`relative flex items-center px-5 py-2 text-sm text-gray-700 hover:bg-amber-600 hover:text-white data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none data-[highlighted]:bg-amber-600 data-[highlighted]:text-white ${className}`}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute left-0 inline-flex w-6 items-center justify-center px-2">
      <Check className="h-4 w-4 font-bold" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
))
SelectItem.displayName = "SelectItem"

export const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={`px-3 py-2 text-sm font-semibold text-gray-900 ${className}`}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

export const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={`my-1 h-px bg-gray-200 ${className}`}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={`flex items-center justify-center h-6 bg-white cursor-default ${className}`}
    {...props}
  >
    <ChevronUp className="h-4 w-4 text-gray-700" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = "SelectScrollUpButton"

export const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={`flex items-center justify-center h-6 bg-white cursor-default ${className}`}
    {...props}
  >
    <ChevronDown className="h-4 w-4 text-gray-700" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = "SelectScrollDownButton"

export const SelectViewport = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Viewport
    ref={ref}
    className={`p-1 ${className}`}
    {...props}
  />
))  
SelectViewport.displayName = "SelectViewport"