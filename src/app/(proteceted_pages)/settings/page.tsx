"use client"

import React from 'react'
import { ThemeToggleWithLabel } from '@/components/ui/theme-toggle'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Theme Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <ThemeToggleWithLabel />
        </div>
      </div>
    </div>
  )
}
