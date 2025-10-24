import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const activeSidebarView = ref<'vocabulary' | 'wordbook' | null>('vocabulary');

  const setActiveSidebarView = (view: 'vocabulary' | 'wordbook' | null) => {
    activeSidebarView.value = view;
  };

  const toggleSidebarView = (view: 'vocabulary' | 'wordbook') => {
    activeSidebarView.value = view;
  };

  return {
    activeSidebarView,
    setActiveSidebarView,
    toggleSidebarView,
  };
});