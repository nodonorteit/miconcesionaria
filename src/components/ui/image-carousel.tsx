'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from './button'

interface ImageCarouselProps {
  images: Array<{
    id: string
    filename: string
    path: string
    isPrimary: boolean
    createdAt: string
  }>
  isOpen: boolean
  onClose: () => void
  initialImageIndex?: number
}

export function ImageCarousel({ images, isOpen, onClose, initialImageIndex = 0 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Reset zoom and position when changing images
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          e.preventDefault()
          zoomIn()
          break
        case '-':
          e.preventDefault()
          zoomOut()
          break
        case '0':
          resetZoom()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, scale])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 5))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.1))
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white hover:text-black"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white hover:text-black"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white hover:text-black"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Zoom controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomIn}
          className="text-white hover:bg-white hover:text-black"
          disabled={scale >= 5}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomOut}
          className="text-white hover:bg-white hover:text-black"
          disabled={scale <= 0.1}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetZoom}
          className="text-white hover:bg-white hover:text-black"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Image counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
        {currentIndex + 1} de {images.length}
      </div>

      {/* Main image container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          src={currentImage.path}
          alt={`Imagen ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            cursor: scale > 1 ? 'grab' : 'default'
          }}
          draggable={false}
        />
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <img
                src={image.path}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 text-white text-xs text-center bg-black bg-opacity-50 px-4 py-2 rounded-full">
        <div>Scroll para zoom • Click y arrastrar para mover • Flechas para navegar</div>
        <div>ESC para cerrar • + / - para zoom • 0 para reset</div>
      </div>
    </div>
  )
} 