import { ref, computed, watch, type Ref } from 'vue';
import type { ArticleData } from '../types';

export function useReadingTime(article: Ref<ArticleData | null>) {
  const estimatedReadingTime = ref<number | null>(null);

  const calculateReadingTime = (articleData: ArticleData) => {
    if (!articleData || !articleData.paragraphs) {
      return null;
    }

    let totalWords = 0;
    // Simple word count for English and Chinese
    articleData.paragraphs.forEach(p => {
      totalWords += p.en.split(/\s+/).filter(word => word.length > 0).length; // English words
      totalWords += p.zh.length; // Chinese characters (approximate as words)
    });

    // Average reading speed: 200 words per minute for English, 300 characters per minute for Chinese
    // Let's use a combined average for simplicity, or adjust based on language mix.
    // For a mixed content, a rough average of 250 "units" per minute might be reasonable.
    const wordsPerMinute = 250; 
    const time = Math.ceil(totalWords / wordsPerMinute);
    return time > 0 ? time : 1; // Ensure at least 1 minute for very short articles
  };

  watch(article, (newArticleValue) => {
    if (newArticleValue) {
      estimatedReadingTime.value = calculateReadingTime(newArticleValue);
    } else {
      estimatedReadingTime.value = null;
    }
  }, { immediate: true });

  return {
    estimatedReadingTime,
  };
}
