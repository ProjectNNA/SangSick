// Preset avatars mapping
const PRESET_AVATARS = {
  lion: '🦁',
  elephant: '🐘',
  penguin: '🐧',
  dolphin: '🐬',
  airplane: '✈️',
  cruise: '🚢',
  car: '🚗',
  bicycle: '🚴',
  rocket: '🚀',
  balloon: '🎈'
}

export default function Avatar({ avatarUrl, fallback, size = 'md', onClick }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-3xl'
  }
  
  // Check if it's a preset avatar
  const isPreset = avatarUrl && PRESET_AVATARS[avatarUrl]
  
  // Only apply hover effects if clickable
  const hoverClasses = onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
  
  if (isPreset) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-yellow-400 dark:to-orange-500 rounded-full flex items-center justify-center ${hoverClasses}`}
        onClick={onClick}
      >
        <span className="text-white dark:text-gray-900">
          {PRESET_AVATARS[avatarUrl]}
        </span>
      </div>
    )
  }
  
  // Custom uploaded image
  if (avatarUrl && !isPreset) {
    return (
      <img 
        src={avatarUrl}
        alt="Avatar"
        className={`${sizeClasses[size]} rounded-full object-cover ${hoverClasses}`}
        onClick={onClick}
        onError={(e) => {
          // Fallback to initials if image fails to load
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'flex'
        }}
      />
    )
  }
  
  // Fallback to initials
  return (
    <div 
      className={`${sizeClasses[size]} bg-indigo-600 dark:bg-yellow-400 rounded-full flex items-center justify-center ${hoverClasses}`}
      onClick={onClick}
    >
      <span className="text-white dark:text-gray-900 font-bold">
        {fallback?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  )
} 