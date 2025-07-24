import React, { useEffect } from 'react'

const TemporaryPage: React.FC = () => {
  useEffect(() => {
    // Set the page title
    document.title = '캐나다 이민 뉴스 - 2025년 7월 24일'
    
    // Add meta tags for Open Graph
    const metaTags = [
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: '7월 24일 캐나다 이민 비자 업데이트' },
      { property: 'og:description', content: '2025년 7월 24일자 캐나다 이민/비자 정책의 모든 변화 요약. 신규 워홀 쿼터, IRCC 발표, 한인 주요 이슈까지 한 번에!' },
      { property: 'og:image', content: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=cover&w=600&q=80' },
      { property: 'og:url', content: 'https://example.com/canada-news-20250724' }
    ]
    
    // Create and append meta tags
    metaTags.forEach(tag => {
      const meta = document.createElement('meta')
      meta.setAttribute('property', tag.property)
      meta.setAttribute('content', tag.content)
      document.head.appendChild(meta)
    })
    
    // Cleanup function to remove meta tags when component unmounts
    return () => {
      metaTags.forEach(tag => {
        const existingMeta = document.querySelector(`meta[property="${tag.property}"]`)
        if (existingMeta) {
          existingMeta.remove()
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <h1>7월 24일 캐나다 이민 비자 업데이트</h1>
      <p>이 페이지는 카카오톡 채팅방에 붙여넣으면 카드가 뜨는지 실험하는 용도의 샘플입니다!</p>
    </div>
  )
}

export default TemporaryPage 