import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getAllUsersWithRoles, updateUserRole } from '../lib/roleUtils'

export default function AdminPage({ user }) {
  const [activeTab, setActiveTab] = useState('questions')
  const [questions, setQuestions] = useState([])
  const [allQuestions, setAllQuestions] = useState([]) // Store all questions for filtering
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Load questions
  const loadQuestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      setAllQuestions(data || [])
      setQuestions(data || [])
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter questions based on search query
  const filterQuestions = (query) => {
    if (!query.trim()) {
      setQuestions(allQuestions)
      return
    }
    
    const filtered = allQuestions.filter(question => 
      question.question.toLowerCase().includes(query.toLowerCase()) ||
      question.category.toLowerCase().includes(query.toLowerCase()) ||
      question.subcategory?.toLowerCase().includes(query.toLowerCase()) ||
      question.explanation?.toLowerCase().includes(query.toLowerCase()) ||
      question.reflection?.toLowerCase().includes(query.toLowerCase()) ||
      question.options.some(option => option.toLowerCase().includes(query.toLowerCase()))
    )
    
    setQuestions(filtered)
  }

  // Load users with roles
  const loadUsers = async () => {
    setLoading(true)
    try {
      const usersData = await getAllUsersWithRoles(user.id)
      if (usersData) {
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'questions') {
      loadQuestions()
    } else if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab])

  // Update user role
  const handleRoleUpdate = async (targetUserId, newRole) => {
    try {
      const success = await updateUserRole(targetUserId, newRole, user.id)
      if (success) {
        await loadUsers() // Refresh the list
        alert('사용자 역할이 업데이트되었습니다.')
      } else {
        alert('역할 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('오류가 발생했습니다.')
    }
  }

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('정말로 이 문제를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error
      
      const updatedQuestions = allQuestions.filter(q => q.id !== questionId)
      setAllQuestions(updatedQuestions)
      setQuestions(questions.filter(q => q.id !== questionId))
      alert('문제가 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('문제 삭제에 실패했습니다.')
    }
  }

  // Edit question
  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setShowEditModal(true)
  }

  // Save edited question
  const handleSaveQuestion = async (updatedQuestion) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          question: updatedQuestion.question,
          options: updatedQuestion.options,
          correctAnswer: updatedQuestion.correctAnswer,
          category: updatedQuestion.category,
          subcategory: updatedQuestion.subcategory,
          difficulty: updatedQuestion.difficulty,
          explanation: updatedQuestion.explanation,
          reflection: updatedQuestion.reflection
        })
        .eq('id', updatedQuestion.id)

      if (error) throw error

      // Update local state
      const updatedAllQuestions = allQuestions.map(q => 
        q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q
      )
      setAllQuestions(updatedAllQuestions)
      filterQuestions(searchQuery) // Re-apply current search
      
      setShowEditModal(false)
      setEditingQuestion(null)
      alert('문제가 수정되었습니다.')
    } catch (error) {
      console.error('Error updating question:', error)
      alert('문제 수정에 실패했습니다.')
    }
  }

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    filterQuestions(query)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            관리자 패널
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            퀴즈 문제와 사용자 역할을 관리할 수 있습니다
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8 justify-center">
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-6 border-b-2 font-medium text-lg ${
                activeTab === 'questions'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              문제 관리
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 border-b-2 font-medium text-lg ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              사용자 관리
            </button>
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">로딩 중...</p>
          </div>
        ) : activeTab === 'questions' ? (
          <QuestionsTab
            questions={questions}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onDelete={handleDeleteQuestion}
            onEdit={handleEditQuestion}
            onRefresh={loadQuestions}
          />
        ) : (
          <UsersTab
            users={users}
            onRoleUpdate={handleRoleUpdate}
            currentUserId={user.id}
          />
        )}

        {/* Edit Question Modal */}
        {showEditModal && editingQuestion && (
          <EditQuestionModal
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onClose={() => {
              setShowEditModal(false)
              setEditingQuestion(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Edit Question Modal Component
function EditQuestionModal({ question, onSave, onClose }) {
  const [formData, setFormData] = useState({
    question: question.question || '',
    options: [...(question.options || ['', '', '', ''])],
    correctAnswer: question.correctAnswer || 0,
    category: question.category || '',
    subcategory: question.subcategory || '',
    difficulty: question.difficulty || 1,
    explanation: question.explanation || '',
    reflection: question.reflection || ''
  })

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.question.trim()) {
      alert('문제를 입력해주세요.')
      return
    }
    
    if (formData.options.some(opt => !opt.trim())) {
      alert('모든 선택지를 입력해주세요.')
      return
    }

    if (!formData.explanation.trim()) {
      alert('해설을 입력해주세요.')
      return
    }

    if (!formData.reflection.trim()) {
      alert('지식의 여운을 입력해주세요.')
      return
    }

    onSave({ ...question, ...formData })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            문제 수정 (#{question.id})
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              문제 *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="문제를 입력하세요"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              선택지 *
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="w-8 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={`선택지 ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                카테고리
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="예: 과학"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                세부 카테고리
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="예: 물리학"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                난이도
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={1}>1 (쉬움)</option>
                <option value={2}>2 (보통)</option>
                <option value={3}>3 (어려움)</option>
              </select>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              해설 * (20-35 단어)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="문제에 대한 해설을 입력하세요 (20-35 단어)"
            />
            <p className="text-xs text-gray-500 mt-1">
              현재 단어 수: {formData.explanation.trim().split(/\s+/).filter(word => word.length > 0).length}
            </p>
          </div>

          {/* Reflection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              지식의 여운 * (10-20 단어)
            </label>
            <textarea
              value={formData.reflection}
              onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="추가적인 지식이나 흥미로운 사실을 입력하세요 (10-20 단어)"
            />
            <p className="text-xs text-gray-500 mt-1">
              현재 단어 수: {formData.reflection.trim().split(/\s+/).filter(word => word.length > 0).length}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              수정 완료
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Questions Tab Component
function QuestionsTab({ questions, searchQuery, onSearch, onDelete, onEdit, onRefresh }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          전체 문제 ({questions.length}개)
        </h3>
        <button
          onClick={onRefresh}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          새로고침
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={onSearch}
            placeholder="문제, 카테고리, 해설 등으로 검색..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            "{searchQuery}" 검색 결과: {questions.length}개 문제 발견
          </p>
        )}
      </div>

      <div className="grid gap-6">
        {questions.map((question) => (
          <div
            key={question.id}
            className="border dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    #{question.id}
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                    {question.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                    난이도 {question.difficulty}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {question.question}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        index === question.correctAnswer
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {index + 1}. {option}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p><strong>정답:</strong> {question.options[question.correctAnswer]}</p>
                  <p><strong>총 답변 수:</strong> {question.totalCount || 0}</p>
                  {question.explanation && (
                    <p><strong>해설:</strong> {question.explanation}</p>
                  )}
                  {question.reflection && (
                    <p><strong>지식의 여운:</strong> {question.reflection}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(question)}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  title="문제 수정"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(question.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="문제 삭제"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Users Tab Component
function UsersTab({ users, onRoleUpdate, currentUserId }) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        사용자 역할 관리 ({users.length}명)
      </h3>

      <div className="grid gap-6">
        {users.map((userRole) => (
          <div
            key={userRole.user_id}
            className="border dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-600 dark:bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white dark:text-gray-900 font-semibold text-sm">
                      {userRole.nickname?.charAt(0).toUpperCase() || userRole.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userRole.nickname || userRole.email?.split('@')[0] || 'Unknown'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {userRole.email || 'Unknown Email'}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  현재 역할: 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    userRole.role === 'admin' 
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {userRole.role === 'admin' ? '관리자' : '사용자'}
                  </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  가입일: {new Date(userRole.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              
              {userRole.user_id !== currentUserId && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => onRoleUpdate(userRole.user_id, 'user')}
                    disabled={userRole.role === 'user'}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    사용자로 변경
                  </button>
                  <button
                    onClick={() => onRoleUpdate(userRole.user_id, 'admin')}
                    disabled={userRole.role === 'admin'}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    관리자로 변경
                  </button>
                </div>
              )}
              
              {userRole.user_id === currentUserId && (
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  (본인 계정)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 