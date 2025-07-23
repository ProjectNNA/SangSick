import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { createDefaultUserRole } from '../lib/roleUtils'

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Password confirmation check for signup
    if (!isLogin && password !== passwordConfirm) {
      setMessage('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage('로그인 성공!')
        setTimeout(() => {
          onLoginSuccess()
        }, 1000)
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nickname: nickname,
            }
          }
        })
        if (error) throw error
        
        // Create default user role if signup was successful
        if (data.user) {
          await createDefaultUserRole(data.user.id)
        }
        
        setMessage('회원가입이 완료되었습니다! 이메일을 확인해주세요.')
      }
    } catch (error: any) {
      // Map common/potential Supabase Auth error messages to Korean
      let msg = error?.message || ''
      let translated = ''
      if (!isLogin) {
        if (msg.toLowerCase().includes('user already registered')) {
          translated = '이미 가입된 이메일입니다.'
        } else if (msg.toLowerCase().includes('invalid email')) {
          translated = '유효하지 않은 이메일 주소입니다.'
        } else if (msg.toLowerCase().includes('password should be at least')) {
          translated = '비밀번호가 너무 짧습니다.'
        } else if (msg.toLowerCase().includes('password is too weak')) {
          translated = '비밀번호가 너무 약합니다.'
        } else if (msg.toLowerCase().includes('email rate limit exceeded')) {
          translated = '이메일 인증 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
        } else if (msg.toLowerCase().includes('invalid login credentials')) {
          translated = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          translated = '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.'
        } else if (msg.toLowerCase().includes('signup not allowed for this email')) {
          translated = '이 이메일로는 회원가입이 허용되지 않습니다.'
        } else if (msg.toLowerCase().includes('password cannot be empty')) {
          translated = '비밀번호를 입력해주세요.'
        } else if (msg.toLowerCase().includes('unexpected error')) {
          translated = '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
      } else {
        if (msg.toLowerCase().includes('invalid login credentials')) {
          translated = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          translated = '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.'
        } else if (msg.toLowerCase().includes('user not found')) {
          translated = '존재하지 않는 사용자입니다.'
        } else if (msg.toLowerCase().includes('invalid email')) {
          translated = '유효하지 않은 이메일 주소입니다.'
        } else if (msg.toLowerCase().includes('unexpected error')) {
          translated = '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
      }
      setMessage(translated || msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setPasswordConfirm('')
    setNickname('')
    setMessage('')
    setIsLogin(true)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLogin ? '로그인' : '회원가입'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    비밀번호 확인
                  </label>
                  <input
                    id="passwordConfirm"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="**********"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    닉네임
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="닉네임을 입력하세요"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-sm font-medium"
              >
                {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
            </div>

            {message && (
              <div className={`text-center text-sm p-3 rounded-lg ${
                message.includes('성공') || message.includes('완료') 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
} 