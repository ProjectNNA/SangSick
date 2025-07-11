import ProfileHeader from './ProfileHeader'
import type { User } from '../types'

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ProfileHeader user={user} onLogout={onLogout} />
      {children}
    </div>
  )
} 