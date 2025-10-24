import { ref, onMounted, onUnmounted, watch } from 'vue';

const debounce = (func: Function, delay: number) => {
  let timeout: number;
  return function(this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

export function useReadingProgress(articleLoaded: () => boolean) {
  const readingProgress = ref(0);

  const updateReadingProgress = () => {
    if (!articleLoaded()) {
      readingProgress.value = 0;
      return;
    }

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

    const totalScrollableHeight = scrollHeight - clientHeight;

    if (totalScrollableHeight === 0) {
      readingProgress.value = 0;
      return;
    }

    readingProgress.value = (scrollTop / totalScrollableHeight) * 100;
  };

  const debouncedUpdateProgress = debounce(updateReadingProgress, 50);

  onMounted(() => {
    window.addEventListener('scroll', debouncedUpdateProgress);
    window.addEventListener('resize', debouncedUpdateProgress); // Recalculate on resize
    updateReadingProgress(); // Initial calculation
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', debouncedUpdateProgress);
    window.removeEventListener('resize', debouncedUpdateProgress);
  });

  watch(articleLoaded, (isLoaded) => {
    if (isLoaded) {
      // Give DOM a moment to render after article loads
      setTimeout(updateReadingProgress, 100);
    }
  });

  return {
    readingProgress,
  };
}
