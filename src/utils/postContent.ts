import type { ParsedContent, PostItem } from '@/types/home'

const parseImages = (images: unknown): ParsedContent['images'] => {
  if (!Array.isArray(images)) return []
  return images
}

export const parseContent = (
  content: PostItem['content'],
  fallbackText = ''
): ParsedContent => {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content) as ParsedContent
      if (parsed && typeof parsed === 'object') {
        return {
          text: typeof parsed.text === 'string' ? parsed.text : content,
          images: parseImages(parsed.images)
        }
      }
    } catch {
      // fall back to plain text content
    }

    return {
      text: content || fallbackText,
      images: []
    }
  }

  if (content && typeof content === 'object') {
    return {
      text: typeof content.text === 'string' ? content.text : fallbackText,
      images: parseImages(content.images)
    }
  }

  return {
    text: fallbackText,
    images: []
  }
}
