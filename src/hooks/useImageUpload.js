import { useState } from 'react'
import { validateFile, validateMultipleFiles } from '../utils/validation'
import { compressImage } from '../utils/helpers'
import toast from 'react-hot-toast'

export const useImageUpload = (options = {}) => {
  const { maxFiles = 5, minFiles = 1, compress = true } = options
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleImageUpload = async (files) => {
    setLoading(true)
    
    try {
      const fileArray = Array.from(files)
      
      const validation = validateMultipleFiles(fileArray, minFiles, maxFiles)
      if (!validation.valid) {
        toast.error(validation.error)
        setLoading(false)
        return { success: false, error: validation.error }
      }

      const processedImages = []
      
      for (const file of fileArray) {
        const reader = new FileReader()
        
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        let finalImage = base64
        if (compress) {
          finalImage = await compressImage(base64, 1200, 0.8)
        }

        processedImages.push(finalImage)
      }

      setImages(processedImages)
      setLoading(false)
      return { success: true, images: processedImages }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Gagal upload foto. Coba lagi ya!')
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const clearImages = () => {
    setImages([])
  }

  return {
    images,
    loading,
    handleImageUpload,
    removeImage,
    clearImages,
    setImages
  }
}
