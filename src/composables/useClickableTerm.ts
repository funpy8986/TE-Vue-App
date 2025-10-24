import { ref, nextTick } from 'vue';
import type { Ref } from 'vue'; // Import Ref type
import type { useUiStore } from '../stores/ui';

export function useClickableTerm(isMobile: Ref<boolean>, uiStore: ReturnType<typeof useUiStore>, openSidebar: () => void, articleSectionRef: Ref<HTMLElement | null>) {
  const activeVocabTerm = ref<string | null>(null);

  const handleArticleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const termElement = target.closest('.clickable-term');

    if (termElement && termElement instanceof HTMLElement) {
      const term = termElement.dataset.term;
      if (term) {
        uiStore.setActiveSidebarView('vocabulary'); // Ensure we are on the vocab analysis view
        if (isMobile.value) {
          openSidebar(); // Use openSidebar to ensure it opens
        }
        const lowerCaseTerm = term.toLowerCase();
        const targetId = `vocab-${lowerCaseTerm}`;
        nextTick(() => {
          setTimeout(() => {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              activeVocabTerm.value = lowerCaseTerm; // Set active term
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              targetElement.classList.add('highlight');
              setTimeout(() => {
                targetElement.classList.remove('highlight');
              }, 2000);
            }
          }, 50); // Add a small delay to ensure the browser has rendered the element
        });
      }
    }
  };

  const handleGoBack = () => {
    if (isMobile.value) {
      toggleSidebar(); // Use toggleSidebar from useSidebar
    }
    if (articleSectionRef.value) {
      articleSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
      activeVocabTerm.value = null; // Reset active term when going back
    }
  };

  return {
    activeVocabTerm,
    handleArticleClick,
    handleGoBack,
  };
}