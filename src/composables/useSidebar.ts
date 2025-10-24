import { ref, onMounted, onUnmounted } from 'vue';

export function useSidebar() {
  const isSidebarOpen = ref(false);
  const isMobile = ref(window.innerWidth <= 1023);

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const openSidebar = () => {
    isSidebarOpen.value = true;
  };

  const handleResize = () => {
    isMobile.value = window.innerWidth <= 1023;
    if (!isMobile.value) {
      isSidebarOpen.value = false; // Close sidebar when switching to desktop view
    }
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    isSidebarOpen,
    isMobile,
    toggleSidebar,
    openSidebar,
  };
}