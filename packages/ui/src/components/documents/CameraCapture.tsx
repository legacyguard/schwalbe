/**
 * Camera Capture Component
 * Mobile document scanning with camera integration
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  RotateCcw,
  FlashOn,
  FlashOff,
  Check,
  X,
  RefreshCw,
  Crop,
  Zap,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface CameraCaptureProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string, file: File) => void
  className?: string
}

interface CaptureGuide {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  tip: string
}

export function CameraCapture({
  isOpen,
  onClose,
  onCapture,
  className
}: CameraCaptureProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [showGuide, setShowGuide] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Document capture guides
  const captureGuides: CaptureGuide[] = [
    {
      id: 'lighting',
      title: 'Dobré osvetlenie',
      description: 'Uistite sa, že dokument je dobre osvetlený',
      icon: <FlashOn className="w-5 h-5" />,
      tip: 'Vyhýbajte sa tieňom a odleskom'
    },
    {
      id: 'flat',
      title: 'Rovný povrch',
      description: 'Položte dokument na rovný povrch',
      icon: <Crop className="w-5 h-5" />,
      tip: 'Vyrovnajte všetky záhyby a ohyby'
    },
    {
      id: 'distance',
      title: 'Správna vzdialenosť',
      description: 'Držte telefón 20-30 cm nad dokumentom',
      icon: <Eye className="w-5 h-5" />,
      tip: 'Celý dokument musí byť viditeľný'
    },
    {
      id: 'steady',
      title: 'Stabilné držanie',
      description: 'Držte telefón pevne a stabilne',
      icon: <Camera className="w-5 h-5" />,
      tip: 'Počkajte na stabilizáciu pred fotografovaním'
    }
  ]

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    setIsInitializing(true)
    setError(null)

    try {
      // Request camera permission
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      streamRef.current = stream
      setHasPermission(true)
      setShowGuide(false)

    } catch (err) {
      console.error('Camera initialization error:', err)

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Prístup ku kamere bol zamietnutý. Povoľte prístup v nastaveniach prehliadača.')
        } else if (err.name === 'NotFoundError') {
          setError('Kamera nebola nájdená na tomto zariadení.')
        } else {
          setError('Nepodarilo sa inicializovať kameru. Skúste to znovu.')
        }
      } else {
        setError('Neočakávaná chyba pri prístupe ku kamere.')
      }

      setHasPermission(false)
    } finally {
      setIsInitializing(false)
    }
  }, [facingMode])

  // Cleanup camera
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Initialize camera when component opens
  useEffect(() => {
    if (isOpen && hasPermission === null) {
      initializeCamera()
    }

    return () => {
      if (!isOpen) {
        cleanup()
        setHasPermission(null)
        setCapturedImage(null)
        setError(null)
      }
    }
  }, [isOpen, initializeCamera, cleanup, hasPermission])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)

    // Create file object
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `document_${Date.now()}.jpg`, { type: 'image/jpeg' })
        // Don't call onCapture yet, wait for user confirmation
      }
    }, 'image/jpeg', 0.9)
  }, [])

  // Confirm capture
  const confirmCapture = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `document_${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(capturedImage, file)
        onClose()
      }
    }, 'image/jpeg', 0.9)
  }, [capturedImage, onCapture, onClose])

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
  }, [])

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    cleanup()
    setHasPermission(null)
    setTimeout(() => {
      initializeCamera()
    }, 100)
  }, [cleanup, initializeCamera])

  // Toggle flash (if supported)
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      const capabilities = track.getCapabilities()

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn } as any]
        })
        setIsFlashOn(!isFlashOn)
      }
    } catch (err) {
      console.warn('Flash not supported:', err)
    }
  }, [isFlashOn])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 bg-black z-50 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <motion.button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-6 h-6" />
        </motion.button>

        <h2 className="text-lg font-semibold">Odfotiť dokument</h2>

        <div className="flex items-center gap-2">
          {/* Flash toggle */}
          <motion.button
            onClick={toggleFlash}
            className={cn(
              "p-2 rounded-full transition-colors",
              isFlashOn ? "bg-yellow-500 text-black" : "bg-white/20 hover:bg-white/30 text-white"
            )}
            whileTap={{ scale: 0.9 }}
          >
            {isFlashOn ? <FlashOn className="w-5 h-5" /> : <FlashOff className="w-5 h-5" />}
          </motion.button>

          {/* Switch camera */}
          <motion.button
            onClick={switchCamera}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        {/* Camera guides */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center p-6"
            >
              <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Ako správne odfotiť dokument
                </h3>

                <div className="space-y-4 mb-6">
                  {captureGuides.map((guide) => (
                    <div key={guide.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        {guide.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {guide.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {guide.description}
                        </p>
                        <p className="text-blue-600 text-xs mt-1">
                          💡 {guide.tip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={() => setShowGuide(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Rozumiem, začať fotografovanie
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Problém s kamerou
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={initializeCamera}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Skúsiť znovu
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Zavrieť
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Inicializácia kamery...</p>
            </div>
          </div>
        )}

        {/* Camera view */}
        {hasPermission && !capturedImage && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Document overlay frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Corner markers */}
                <div className="w-80 h-56 relative">
                  {[
                    { position: 'top-0 left-0', rotate: '0' },
                    { position: 'top-0 right-0', rotate: '90' },
                    { position: 'bottom-0 left-0', rotate: '-90' },
                    { position: 'bottom-0 right-0', rotate: '180' }
                  ].map((corner, index) => (
                    <div
                      key={index}
                      className={cn(
                        "absolute w-8 h-8 border-4 border-white",
                        corner.position
                      )}
                      style={{
                        transform: `rotate(${corner.rotate}deg)`,
                        borderRightColor: 'transparent',
                        borderBottomColor: 'transparent'
                      }}
                    />
                  ))}
                </div>

                {/* Instructions */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-center">
                  <p className="text-sm bg-black/50 px-4 py-2 rounded-full">
                    Umiestnite dokument do rámčeka
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preview captured image */}
        {capturedImage && (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Captured document"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {/* Canvas for image processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {/* Bottom controls */}
      <div className="bg-black/50 p-6">
        {!capturedImage ? (
          // Capture controls
          <div className="flex items-center justify-center">
            <motion.button
              onClick={capturePhoto}
              disabled={!hasPermission || isInitializing}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.9 }}
              animate={hasPermission ? {
                boxShadow: [
                  "0 0 0 0 rgba(255, 255, 255, 0.4)",
                  "0 0 0 10px rgba(255, 255, 255, 0)",
                  "0 0 0 0 rgba(255, 255, 255, 0)"
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Camera className="w-8 h-8 text-gray-900" />
            </motion.button>
          </div>
        ) : (
          // Preview controls
          <div className="flex items-center justify-center gap-6">
            <motion.button
              onClick={retakePhoto}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Opakovať</span>
            </motion.button>

            <motion.button
              onClick={confirmCapture}
              className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <Check className="w-5 h-5" />
              <span>Použiť fotku</span>
            </motion.button>
          </div>
        )}

        {/* Guide toggle */}
        {hasPermission && !capturedImage && (
          <div className="text-center mt-4">
            <motion.button
              onClick={() => setShowGuide(true)}
              className="text-white/80 hover:text-white text-sm underline transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              Zobraziť návod na fotografovanie
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Mobile camera detection utility
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Camera capabilities check
export const checkCameraSupport = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')

    return {
      hasCamera: cameras.length > 0,
      hasMultipleCameras: cameras.length > 1,
      devices: cameras
    }
  } catch (error) {
    return {
      hasCamera: false,
      hasMultipleCameras: false,
      devices: []
    }
  }
}