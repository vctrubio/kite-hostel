'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallButtonProps {
  className?: string
  showInstructions?: boolean
}

export function PWAInstallButton({ className, showInstructions: _showInstructions = true }: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // Detect device and browser type
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = typeof window !== 'undefined' && /Android/.test(navigator.userAgent)
  const isSafari = typeof window !== 'undefined' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  const isStandalone = typeof window !== 'undefined' && (window.navigator as any).standalone === true

  useEffect(() => {
    // Check if already installed
    if (isStandalone || window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Handle beforeinstallprompt for Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // For iOS Safari, show install instructions if not in standalone mode
    if (isIOS && isSafari && !isStandalone) {
      setShowInstallButton(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isIOS, isSafari, isStandalone])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show iOS instructions for Safari
      if (isIOS && isSafari) {
        setShowIOSInstructions(true)
        return
      }
      return
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setShowInstallButton(false)
        setDeferredPrompt(null)
      }
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  // Don't show if not supported and not iOS Safari
  if (!showInstallButton) {
    return null
  }

  return (
    <>
      <Button
        onClick={handleInstallClick}
        className={cn(
          "relative overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg",
          className
        )}
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        Install App
        {isIOS && <Smartphone className="w-4 h-4 ml-2" />}
        {isAndroid && <Monitor className="w-4 h-4 ml-2" />}
      </Button>

      {/* iOS Installation Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Install Kite Hostel</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIOSInstructions(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3 text-sm">
              <p>To install this app on your iPhone:</p>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Share className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>1. Tap the Share button at the bottom of Safari</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>2. Scroll down and tap "Add to Home Screen"</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>3. Tap "Add" to install the app</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

// Hook for checking installation status
export function usePWAInstallation() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true

    setIsInstalled(isStandalone)

    // Check if can be installed
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS Safari check
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    if (isIOS && isSafari && !isStandalone) {
      setCanInstall(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  return { isInstalled, canInstall }
}