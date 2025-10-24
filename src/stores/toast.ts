import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const showToast = ref(false);
  const toastMessage = ref('');
  let toastTimeout: number | undefined;

  const triggerToast = (message: string) => {
    toastMessage.value = message;
    showToast.value = true;

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastTimeout = setTimeout(() => {
      showToast.value = false;
      toastMessage.value = '';
    }, 3000); // Toast disappears after 3 seconds
  };

  return {
    showToast,
    toastMessage,
    triggerToast,
  };
});