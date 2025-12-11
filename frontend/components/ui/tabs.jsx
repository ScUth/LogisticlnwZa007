"use client"

import React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

export const Tabs = TabsPrimitive.Root

export const TabsList = React.forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`inline-flex border-b border-gray-300 mb-4 ${className}`}
    {...props}
  >
    {children}
  </TabsPrimitive.List>
))
TabsList.displayName = "TabsList"

export const TabsTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = "TabsTrigger"

export const TabsContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`mt-2 ${className}`}
    {...props}
  >
    {children}
  </TabsPrimitive.Content>
))
TabsContent.displayName = "TabsContent"
