import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhotoUploadProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  onUpload: (file: File) => Promise<string>
  userId?: string
}

const PhotoUpload = ({ photos, onPhotosChange, onUpload, userId }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate image file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploading(true)
    try {
      const url = await onUpload(file)
      onPhotosChange([...photos, url])
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">Photos</label>
      
      {/* Photo thumbnails */}
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {photos.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-white/20"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Upload button */}
      <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer transition-colors">
        <Upload size={18} />
        <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Upload Photo'}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}

export default PhotoUpload

