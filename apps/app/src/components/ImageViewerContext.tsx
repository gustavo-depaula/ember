import { createContext, useCallback, useContext, useState } from 'react'
import { ImageViewer, type ViewerImage } from './ImageViewer'

type ImageViewerState = {
  openViewer: (images: ViewerImage[], initialIndex?: number) => void
}

const ImageViewerContext = createContext<ImageViewerState | undefined>(undefined)

export function ImageViewerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [images, setImages] = useState<ViewerImage[]>([])
  const [initialIndex, setInitialIndex] = useState(0)

  const openViewer = useCallback((imgs: ViewerImage[], index = 0) => {
    setImages(imgs)
    setInitialIndex(index)
    setVisible(true)
  }, [])

  const onClose = useCallback(() => {
    setVisible(false)
  }, [])

  return (
    <ImageViewerContext.Provider value={{ openViewer }}>
      {children}
      <ImageViewer
        visible={visible}
        images={images}
        initialIndex={initialIndex}
        onClose={onClose}
      />
    </ImageViewerContext.Provider>
  )
}

export function useImageViewer(): ImageViewerState {
  const ctx = useContext(ImageViewerContext)
  if (!ctx) {
    return { openViewer: () => {} }
  }
  return ctx
}
