/**
 * Image utility functions for avatar handling
 */

// Resize image to specified dimensions while maintaining aspect ratio
export const resizeImage = (file, maxWidth = 150, maxHeight = 150, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        'image/jpeg',
        quality
      )
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Validate image file type and size
export const validateImageFile = (file, maxSizeM = 5) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = maxSizeM * 1024 * 1024 // Convert to bytes
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.')
  }
  
  if (file.size > maxSize) {
    throw new Error(`파일 크기가 너무 큽니다. ${maxSizeM}MB 이하의 파일만 업로드 가능합니다.`)
  }
  
  return true
}

// Generate a unique filename for the avatar
export const generateAvatarFilename = (userId, fileExtension = 'jpg') => {
  const timestamp = Date.now()
  return `${userId}/avatar_${timestamp}.${fileExtension}`
}

// Create a preview URL for the selected image
export const createImagePreview = (file) => {
  return URL.createObjectURL(file)
}

// Cleanup preview URL to prevent memory leaks
export const cleanupImagePreview = (previewUrl) => {
  if (previewUrl && previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl)
  }
}

// Convert data URL to blob
export const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
} 