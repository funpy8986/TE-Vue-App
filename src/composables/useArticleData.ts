import { ref, onMounted } from 'vue';
import type { ArticleData } from '../types';

export function useArticleData() {
  const article = ref<ArticleData | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const articleName = params.get('article');

      // Basic security check for the filename
      const validNameRegex = /^[a-zA-Z0-9-_]+$/;
      const defaultArticle = 'intel-analysis';

      let fileName = defaultArticle;
      if (articleName && validNameRegex.test(articleName)) {
        fileName = articleName;
      }

      const filePath = `data/${fileName}.data.json`;

      const response = await fetch(filePath);

      if (!response.ok) {
        // If the requested article doesn't exist, you might want to fall back to the default
        // or show a specific 'not found' error. Here, we'll just throw an error.
        throw new Error(`Could not load article data from ${filePath}`);
      }

      const rawArticle: ArticleData = await response.json();

      // Reorder vocabulary based on appearance in the text
      if (rawArticle && rawArticle.paragraphs && rawArticle.vocabulary) {
        const fullText = rawArticle.paragraphs.map(p => p.en).join(' ');
        
        rawArticle.vocabulary.sort((a, b) => {
            // Find the first occurrence of each term (case-insensitive)
            const indexA = fullText.toLowerCase().indexOf(a.term.toLowerCase());
            const indexB = fullText.toLowerCase().indexOf(b.term.toLowerCase());

            // Handle cases where a term might not be found in the text
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
        });
      }
      
      article.value = rawArticle;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  });

  return {
    article,
    loading,
    error,
  };
}