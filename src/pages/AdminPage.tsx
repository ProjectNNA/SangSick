import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { updateUserRole } from '../lib/roleUtils'
import { useDebounce } from '../lib/hooks'
import type { AdminPageProps, Question } from '../types'

interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface EditQuestionModalProps {
  question: Question;
  onSave: (updatedQuestion: Question) => void;
  onClose: () => void;
}

interface QuestionsTabProps {
  questions: Question[];
  allQuestions: Question[];
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (questionId: number) => void;
  onEdit: (question: Question) => void;
  onRefresh: () => void;
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  onPageChange: (page: number) => void;
}

interface UsersTabProps {
  users: User[];
  onRoleUpdate: (targetUserId: string, newRole: string) => void;
  currentUserId: string;
}

export default function AdminPage({ user }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('questions')
  const [questions, setQuestions] = useState<Question[]>([])
  const [allQuestions, setAllQuestions] = useState<Question[]>([]) // Store all questions for filtering
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const questionsPerPage = 20
  
  // Debounce search query to prevent excessive database calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Load questions with pagination
  const loadQuestions = async (page = 1, search = '') => {
    try {
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })

      if (search) {
        query = query.or(`question.ilike.%${search}%,category.ilike.%${search}%,subcategory.ilike.%${search}%,explanation.ilike.%${search}%`)
      }

      const from = (page - 1) * questionsPerPage
      const to = from + questionsPerPage - 1

      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      setQuestions(data || [])
      setTotalQuestions(count || 0)
      setTotalPages(Math.ceil((count || 0) / questionsPerPage))

      // Also store all questions for filtering (without pagination)
      if (!search) {
        const { data: allData } = await supabase.from('questions').select('*')
        setAllQuestions(allData || [])
      }
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadQuestions(page, searchQuery)
  }

  // Load users 
  const loadUsers = async () => {
    try {
      const { data: usersData, error } = await supabase.rpc('get_users_with_roles')
      if (error) throw error
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  useEffect(() => {
    loadQuestions()
    loadUsers()
  }, [])

  // Handle role update
  const handleRoleUpdate = async (targetUserId: string, newRole: string) => {
    try {
      const success = await updateUserRole(targetUserId, newRole as 'admin' | 'user', user.id)
      if (success) {
        loadUsers() // Refresh users list
        alert('역할이 성공적으로 업데이트되었습니다.')
      } else {
        alert('역할 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('역할 업데이트 중 오류가 발생했습니다.')
    }
  }

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('정말로 이 문제를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      loadQuestions(currentPage, searchQuery) // Refresh current page
      alert('문제가 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('문제 삭제 중 오류가 발생했습니다.')
    }
  }

  // Handle question editing
  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setShowEditModal(true)
  }

  // Handle saving edited question
  const handleSaveQuestion = async (updatedQuestion: Question) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          question: updatedQuestion.question,
          category: updatedQuestion.category,
          subcategory: updatedQuestion.subcategory,
          difficulty: updatedQuestion.difficulty,
          options: updatedQuestion.options,
          correctAnswer: updatedQuestion.correctAnswer,
          explanation: updatedQuestion.explanation,
          reflection: updatedQuestion.reflection,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedQuestion.id)

      if (error) throw error

      setShowEditModal(false)
      setSelectedQuestion(null)
      loadQuestions(currentPage, searchQuery) // Refresh current page
      alert('문제가 성공적으로 수정되었습니다.')
    } catch (error) {
      console.error('Error updating question:', error)
      alert('문제 수정 중 오류가 발생했습니다.')
    }
  }

  // Handle search - now uses debouncing to prevent excessive queries
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page
  }

  // Effect to handle debounced search
  useEffect(() => {
    loadQuestions(currentPage, debouncedSearchQuery)
  }, [debouncedSearchQuery, currentPage])

  return (
    <div className="h-full overflow-y-auto">
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
        {activeTab === 'questions' && (
          <QuestionsTab
            questions={questions}
            allQuestions={allQuestions}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onDelete={handleDeleteQuestion}
            onEdit={handleEditQuestion}
            onRefresh={() => loadQuestions(currentPage, debouncedSearchQuery)}
            currentPage={currentPage}
            totalPages={totalPages}
            totalQuestions={totalQuestions}
            onPageChange={handlePageChange}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab
            users={users}
            onRoleUpdate={handleRoleUpdate}
            currentUserId={user.id}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedQuestion && (
          <EditQuestionModal
            question={selectedQuestion}
            onSave={handleSaveQuestion}
            onClose={() => {
              setShowEditModal(false)
              setSelectedQuestion(null)
            }}
          />
        )}
      </div>
    </div>
    </div>
  )
}

// Edit Question Modal Component
function EditQuestionModal({ question, onSave, onClose }: EditQuestionModalProps) {
  const [formData, setFormData] = useState({
    question: question.question,
    category: question.category,
    subcategory: question.subcategory,
    difficulty: question.difficulty,
    options: question.options || ['', '', '', ''],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || '',
    reflection: question.reflection || ''
  })

  const categories = [
    '과학', '역사', '지리', '문학', '스포츠', '예술'
  ]

  const subcategories: Record<string, string[]> = {
    '과학': ['물리', '화학', '생물', '지구과학', '수학', '공학'],
    '역사': ['한국사', '세계사', '문화사', '인물', '사건', '시대'],
    '지리': ['자연지리', '인문지리', '지역지리', '기후', '지형', '도시'],
    '문학': ['한국문학', '세계문학', '시', '소설', '희곡', '수필'],
    '스포츠': ['축구', '야구', '농구', '올림픽', '개인종목', '기록'],
    '예술': ['미술', '음악', '영화', '건축', '조각', '디자인']
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.question.trim()) {
      alert('문제를 입력해주세요.')
      return
    }
    
    if (formData.options.some(option => !option.trim())) {
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

    onSave({
      ...question,
      ...formData
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              문제 수정
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                문제 *
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
                placeholder="문제를 입력하세요"
                required
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    category: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  서브카테고리 *
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="서브카테고리를 입력하세요"
                  required
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  예: {(subcategories[formData.category] || []).slice(0, 3).join(', ')} 등
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                난이도 * (1-5)
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>
                    {level}★ - {"★".repeat(level)}{"☆".repeat(5-level)} ({level * 10}점)
                  </option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                선택지 *
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder={`선택지 ${index + 1}`}
                      required
                    />
                    {index === formData.correctAnswer && (
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">정답</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                정답 *
              </label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                {formData.options.map((option, index) => (
                  <option key={index} value={index}>
                    {index + 1}. {option || `선택지 ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                해설 * (15-20 한국어 단어)
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
                placeholder="해설을 입력하세요 (15-20 단어)"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                현재 단어 수: {formData.explanation.trim().split(/\s+/).filter((word: string) => word.length > 0).length}
              </p>
            </div>

            {/* Reflection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                지식의 여운 * (8-15 한국어 단어)
              </label>
              <textarea
                value={formData.reflection}
                onChange={(e) => setFormData(prev => ({ ...prev, reflection: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={2}
                placeholder="지식의 여운을 입력하세요 (8-15 단어)"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                현재 단어 수: {formData.reflection.trim().split(/\s+/).filter((word: string) => word.length > 0).length}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Questions Tab Component
function QuestionsTab({ 
  questions, 
  allQuestions,
  searchQuery, 
  onSearch, 
  onDelete, 
  onEdit, 
  onRefresh, 
  currentPage, 
  totalPages, 
  totalQuestions, 
  onPageChange 
}: QuestionsTabProps) {
  // Calculate difficulty distribution
  const difficultyDistribution = useMemo(() => {
    const distribution = [1, 2, 3, 4, 5].map(difficulty => {
      const count = allQuestions.filter(q => q.difficulty === difficulty).length;
      const percentage = allQuestions.length > 0 ? (count / allQuestions.length * 100).toFixed(1) : '0';
      return { difficulty, count, percentage };
    });
    return distribution;
  }, [allQuestions]);

  return (
    <div>
      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="문제, 카테고리, 해설 검색..."
            value={searchQuery}
            onChange={onSearch}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={onRefresh}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* Difficulty Distribution */}
      <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          난이도별 문제 분포
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {difficultyDistribution.map(({ difficulty, count, percentage }) => (
            <div key={difficulty} className="text-center">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  {count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {percentage}%
                </div>
                <div className="flex justify-center items-center space-x-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {difficulty}★
                  </span>
                </div>
                <div className="text-yellow-500 text-lg">
                  {"★".repeat(difficulty)}{"☆".repeat(5 - difficulty)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {difficulty * 10}점
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          전체 {allQuestions.length}개 문제 중 난이도별 분포
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        총 {totalQuestions}개 문제 (페이지 {currentPage}/{totalPages})
      </div>

      {/* Questions List */}
      <div className="space-y-4 mb-6">
        {questions.map((question: Question) => (
          <div key={question.id} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded text-sm">
                    {question.category}
                  </span>
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm">
                    {question.subcategory}
                  </span>
                  <div className="text-yellow-500">
                    {"★".repeat(question.difficulty)}{"☆".repeat(5 - question.difficulty)}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {question.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {question.options.map((option: string, index: number) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        index === question.correctAnswer
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="font-medium">{index + 1}.</span> {option}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>해설:</strong> {question.explanation}
                    </p>
                  </div>
                )}
                {question.reflection && (
                  <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      <strong>지식의 여운:</strong> "{question.reflection}"
                    </p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onEdit(question)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(question.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          
          {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            )
          })}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}

// Users Tab Component
function UsersTab({ users, onRoleUpdate, currentUserId }: UsersTabProps) {
  return (
    <div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                사용자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                역할
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                가입일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((userRole: User) => (
              <tr key={userRole.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {userRole.nickname || 'N/A'}
                    {userRole.id === currentUserId && (
                      <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(나)</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {userRole.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={userRole.role}
                                         onChange={(e) => onRoleUpdate(userRole.id, e.target.value)}
                    disabled={userRole.id === currentUserId}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(userRole.created_at).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 