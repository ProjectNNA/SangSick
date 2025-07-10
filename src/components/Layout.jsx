import ProfileHeader from './ProfileHeader'

export default function Layout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ProfileHeader user={user} onLogout={onLogout} />
      {children}
    </div>
  )
} 