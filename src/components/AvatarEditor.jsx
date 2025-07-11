import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  resizeImage, 
  validateImageFile, 
  generateAvatarFilename, 
  createImagePreview, 
  cleanupImagePreview 
} from '../utils/imageUtils'

// Preset avatars with animals and objects
const PRESET_AVATARS = [
  { id: 'lion', emoji: '🦁', name: '사자' },
  { id: 'elephant', emoji: '🐘', name: '코끼리' },
  { id: 'penguin', emoji: '🐧', name: '펭귄' },
  { id: 'dolphin', emoji: '🐬', name: '돌고래' },
  { id: 'airplane', emoji: '✈️', name: '비행기' },
  { id: 'cruise', emoji: '🚢', name: '크루즈' },
  { id: 'car', emoji: '🚗', name: '자동차' },
  { id: 'bicycle', emoji: '🚴', name: '자전거' },
  { id: 'rocket', emoji: '🚀', name: '로켓' },
  { id: 'balloon', emoji: '🎈', name: '풍선' }
]

export default function AvatarEditor({ user, currentAvatar, onAvatarUpdate, onClose }) {
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [customImage, setCustomImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('preset') // 'preset' or 'upload'
  const fileInputRef = useRef(null)

  // Initialize current avatar
  useEffect(() => {
    if (currentAvatar) {
      // Check if current avatar is a preset
      const preset = PRESET_AVATARS.find(p => p.id === currentAvatar)
      if (preset) {
        setSelectedPreset(preset.id)
        setActiveTab('preset')
      } else {
        // It's a custom image
        setPreviewUrl(currentAvatar)
        setActiveTab('upload')
      }
    }
  }, [currentAvatar])

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      // Validate the file
      validateImageFile(file)
      
      // Create preview
      const preview = createImagePreview(file)
      setPreviewUrl(preview)
      setCustomImage(file)
      setSelectedPreset(null)
      
    } catch (error) {
      alert(error.message)
    }
  }

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId)
    setCustomImage(null)
    if (previewUrl) {
      cleanupImagePreview(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleSave = async () => {
    if (!selectedPreset && !customImage) {
      alert('아바타를 선택하거나 이미지를 업로드해주세요.')
      return
    }

    setUploading(true)
    
    try {
      let avatarUrl = null

      // Clean up old custom image if switching to preset
      if (selectedPreset && currentAvatar && currentAvatar.includes('supabase.co/storage')) {
        try {
          const fileName = currentAvatar.split('/').pop()
          const filePath = `${user.id}/${fileName}`
          await supabase.storage.from('avatars').remove([filePath])
          console.log('Old avatar file cleaned up:', filePath)
        } catch (error) {
          console.warn('Could not clean up old avatar file:', error)
        }
      }

      if (selectedPreset) {
        // Save preset avatar ID
        avatarUrl = selectedPreset
      } else if (customImage) {
        // Clean up old custom image if replacing with new one
        if (currentAvatar && currentAvatar.includes('supabase.co/storage')) {
          try {
            const fileName = currentAvatar.split('/').pop()
            const filePath = `${user.id}/${fileName}`
            await supabase.storage.from('avatars').remove([filePath])
            console.log('Old avatar file cleaned up:', filePath)
          } catch (error) {
            console.warn('Could not clean up old avatar file:', error)
          }
        }

        // Upload custom image
        const resizedImage = await resizeImage(customImage)
        const filename = generateAvatarFilename(user.id)
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filename, resizedImage, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          console.error('Storage upload error:', error)
          if (error.statusCode === '404') {
            throw new Error('스토리지 버킷이 설정되지 않았습니다. Supabase 대시보드에서 "avatars" 버킷을 생성해주세요.')
          }
          throw error
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filename)
        
        avatarUrl = publicUrl
      }

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          ...user.user_metadata,
          avatar_url: avatarUrl
        }
      })

      if (error) throw error

      // Refresh the user session to get updated metadata
      await supabase.auth.refreshSession()

      // Call the callback to update parent component
      onAvatarUpdate(avatarUrl)
      onClose()
      
      alert('아바타가 업데이트되었습니다!')
      
    } catch (error) {
      console.error('Error updating avatar:', error)
      alert('아바타 업데이트에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    if (previewUrl) {
      cleanupImagePreview(previewUrl)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              아바타 편집
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-t-lg ${
                activeTab === 'preset'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              기본 아바타
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-t-lg ${
                activeTab === 'upload'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              이미지 업로드
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            {activeTab === 'preset' ? (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  원하는 아바타를 선택하세요
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {PRESET_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handlePresetSelect(avatar.id)}
                      className={`aspect-square flex items-center justify-center text-2xl rounded-lg border-2 hover:border-indigo-500 transition-colors ${
                        selectedPreset === avatar.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      title={avatar.name}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  이미지를 업로드하세요 (최대 5MB, JPG/PNG/GIF/WEBP)
                </p>
                
                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full mx-auto object-cover"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        클릭하여 다른 이미지 선택
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        클릭하여 이미지 업로드
                      </p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={uploading || (!selectedPreset && !customImage)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {uploading ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 