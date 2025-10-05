'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { PWAInstallButton, usePWAInstallation } from './PWAInstallButton'

export function PWAInstallBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { isInstalled, canInstall } = usePWAInstallation()

  // Don't show if already installed, dismissed, or can't install
  if (isInstalled || dismissed || !canInstall) {
    return null
  }

  return (
    <div className="bg-accent/50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Image 
                src="/icons/icon-72x72.png" 
                alt="Kite Hostel" 
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg shadow-sm"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">
                Install Kite Hostel App
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Get the full experience with offline access and home screen installation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PWAInstallButton showInstructions={true} />
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-accent rounded-md transition-colors hover-teal-border"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}