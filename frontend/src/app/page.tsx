'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { supabase } from '../lib/supabaseClient'

interface Article {
  title: string
  url: string
  source?: string
  year?: string
  citations?: string
  abstract?: string
}

interface SearchResult {
  query: string
  articles: Article[]
  total_results: number
}

export default function Home() {
  const [query, setQuery] = useState('Machine Learning Algorithms')
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState('search')

  // Dummy search history data
  const searchHistory = [
    { query: 'Machine Learning Algorithms', time: '2 hours ago', results: 5, active: true },
    { query: 'Climate Change Impact', time: 'Yesterday', results: 5, active: false },
    { query: 'Quantum Computing', time: '3 days ago', results: 5, active: false },
    { query: 'Artificial Intelligence Ethics', time: '1 week ago', results: 5, active: false },
    { query: 'Renewable Energy Systems', time: '2 weeks ago', results: 5, active: false },
  ]

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSearchResults([])
    setLoading(true)
    setCurrentPage('results')
  
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ query }),
      })
      
  

      const reader = res.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          fullResponse += chunk
        }
      }

      // Try to parse the JSON response
      try {
        const lines = fullResponse.split('\n')
        for (const line of lines) {
          if (line.trim() && line.startsWith('{')) {
            const resultData: SearchResult = JSON.parse(line)
            setSearchResults(resultData.articles)
            break
          }
        }
      } catch (parseError) {
        console.log('Could not parse JSON response, using fallback display')
        // Fallback: display the raw response
        setSearchResults([{
          title: 'Search Results',
          url: '#',
          abstract: fullResponse
        }])
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      setSearchResults([{
        title: 'Error',
        url: '#',
        abstract: 'Failed to fetch search results. Please try again.'
      }])
    }

    setLoading(false)
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    setCurrentPage('results')
  }

  // Function to extract domain from URL for source
  const getSourceFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.charAt(0).toUpperCase() + domain.slice(1)
    } catch {
      return 'Unknown Source'
    }
  }

  return (
    <div className={styles.container}>
      {/* Top Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.navTitle}>Research Assistant AI</div>
        <div className={styles.navLinks}>
          <button 
            className={`${styles.navLink} ${currentPage === 'search' ? styles.active : ''}`}
            onClick={() => setCurrentPage('search')}
          >
            Search
          </button>
          <button 
            className={`${styles.navLink} ${currentPage === 'results' ? styles.active : ''}`}
            onClick={() => setCurrentPage('results')}
          >
            Results
          </button>
        </div>
      </nav>

      <div className={styles.mainContent}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.historySection}>
            <h3 className={styles.historyTitle}>
              <span className={styles.clockIcon}>🕐</span>
              Search History
            </h3>
            <div className={styles.historyList}>
              {searchHistory.map((item, index) => (
                <div 
                  key={index} 
                  className={`${styles.historyItem} ${item.active ? styles.activeHistory : ''}`}
                  onClick={() => handleHistoryClick(item.query)}
                >
                  <div className={styles.historyQuery}>{item.query}</div>
                  <div className={styles.historyMeta}>
                    {item.time} • {item.results} results
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.content}>
          {currentPage === 'search' ? (
            <div className={styles.searchPage}>
              <h1 className={styles.searchTitle}>Research Assistant AI</h1>
              <form onSubmit={handleSubmit} className={styles.searchForm}>
                <div className={styles.searchBar}>
                  <span className={styles.searchIcon}>🔍</span>
                  <input
                    type="text"
                    placeholder="Enter your research query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  <button type="submit" className={styles.searchButton} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={styles.resultsPage}>
              <div className={styles.searchBarContainer}>
                <div className={styles.searchBar}>
                  <span className={styles.searchIcon}>🔍</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  <button onClick={handleSubmit} className={styles.searchButton} disabled={loading}>
                    Search
                  </button>
                </div>
              </div>

              <div className={styles.resultsHeader}>
                <h2 className={styles.resultsTitle}>Top {searchResults.length} Research Articles</h2>
                <p className={styles.resultsSubtitle}>Showing results for '{query}'</p>
              </div>

              {loading && (
                <div className={styles.loadingMessage}>
                  🔍 Searching for research articles...
                </div>
              )}

              <div className={styles.resultsList}>
                {searchResults.map((article, index) => (
                  <div key={index} className={styles.articleCard}>
                    <div className={styles.articleHeader}>
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      <span className={styles.documentIcon}>📄</span>
                    </div>
                    <div className={styles.articleMeta}>
                      <span className={styles.source}>{article.source || getSourceFromUrl(article.url)}</span>
                      {article.year && <span className={styles.year}>{article.year}</span>}
                      {article.citations && <span className={styles.citations}>{article.citations}</span>}
                    </div>
                    {article.abstract && (
                      <p className={styles.articleAbstract}>{article.abstract}</p>
                    )}
                    <div className={styles.articleActions}>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.viewButton}
                      >
                        View Article
                      </a>
                      <button className={styles.summaryButton}>Summary</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Right Side Icons */}
      <div className={styles.rightIcons}>
        <div className={styles.brainIcon}>🧠</div>
        <button className={styles.helpButton}>?</button>
      </div>
    </div>
  )
}
