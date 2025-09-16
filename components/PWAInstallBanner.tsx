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
    <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200 dark:from-sky-900/20 dark:to-blue-900/20 dark:border-sky-800">
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
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Install Kite Hostel App
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Get the full experience with offline access and home screen installation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PWAInstallButton showInstructions={true} />
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/50 rounded-md transition-colors dark:hover:bg-gray-800/50"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}