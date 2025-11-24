import { JournalEntry } from '../types'

/**
 * Get greeting based on time of day
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

/**
 * Format date to readable string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }

  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  // Check if it's this year
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Different year
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Format date with year for "On This Day" entries
 */
export const formatDateWithYear = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/**
 * Extract plain text from HTML and return a snippet
 */
export const getTextSnippet = (html: string, maxLength: number = 100): string => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Get text content and remove extra whitespace
  const text = tempDiv.textContent || tempDiv.innerText || ''
  const cleaned = text.trim().replace(/\s+/g, ' ')

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  // Truncate and add ellipsis
  return cleaned.substring(0, maxLength).trim() + '...'
}

/**
 * Get mood emoji from mood value
 */
export const getMoodEmoji = (mood: number): string => {
  const moodMap: Record<number, string> = {
    1: '😢',
    2: '😐',
    3: '🙂',
    4: '😊',
    5: '😄',
  }
  return moodMap[mood] || '😐'
}

