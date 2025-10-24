import { ref } from 'vue';

export function useTranslationToggle() {
  const showTranslation = ref(false);

  const toggleTranslation = () => {
    showTranslation.value = !showTranslation.value;
  };

  return {
    showTranslation,
    toggleTranslation,
  };
}