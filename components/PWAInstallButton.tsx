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

export function PWAInstallButton({ className, showInstructions = true }: PWAInstallButtonProps) {
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

  // Handle ESC key to close modal when it's open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showIOSInstructions) {
        setShowIOSInstructions(false)
      }
    }

    if (showIOSInstructions) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showIOSInstructions])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show iOS instructions for Safari or generic instructions when showInstructions is true
      if (isIOS && isSafari) {
        setShowIOSInstructions(true)
        return
      }
      if (showInstructions) {
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

  // Don't show if not supported and not iOS Safari, unless showInstructions is explicitly true
  if (!showInstallButton && !showInstructions) {
    return null
  }

  return (
    <>
      <Button
        onClick={handleInstallClick}
        className={cn(
          "relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover-lift glow-teal",
          className
        )}
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        Install App
        {isIOS && <Smartphone className="w-4 h-4 ml-2" />}
        {isAndroid && <Monitor className="w-4 h-4 ml-2" />}
      </Button>

      {/* Installation Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Install Kite Hostel</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIOSInstructions(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="text-center mb-4">To install this app on your mobile device:</p>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                <Share className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-left">1. Tap the Share button at the bottom of Safari</span>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-left">2. Scroll down and tap "Add to Home Screen"</span>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-left">3. Tap "Add" to install the app</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
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