import { onMounted, onUnmounted, nextTick } from 'vue';

// Debounce function to limit how often a function is called
const debounce = (func: Function, delay: number) => {
  let timeout: number;
  return function(this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

export function useScrollPersistence(articleLoaded: () => boolean) {
  const SAVE_KEY = 'article-scroll-position';

  const saveScrollPosition = () => {
    if (articleLoaded()) {
      localStorage.setItem(SAVE_KEY, window.scrollY.toString());
    }
  };

  const restoreScrollPosition = () => {
    const savedScrollY = localStorage.getItem(SAVE_KEY);
    if (savedScrollY) {
      window.scrollTo(0, parseInt(savedScrollY, 10));
    }
  };

  const debouncedSaveScroll = debounce(saveScrollPosition, 200);

  onMounted(() => {
    // Restore scroll position after article content is rendered
    nextTick(() => {
      // Add a small delay to ensure all content is rendered and layout is stable
      setTimeout(() => {
        restoreScrollPosition();
      }, 100); // 100ms delay
    });
    window.addEventListener('scroll', debouncedSaveScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', debouncedSaveScroll);
  });

  return {
    restoreScrollPosition, // Expose if needed for manual trigger
  };
}