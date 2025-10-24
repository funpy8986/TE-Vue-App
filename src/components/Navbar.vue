<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  showTranslation: boolean;
  showAudioPlayer: boolean;
  isMobile: boolean;
  readingProgress: number; // Add readingProgress prop
  activeSidebarView: 'vocabulary' | 'wordbook' | null; // New prop to indicate active sidebar view
}>();

const emit = defineEmits<{
  (e: 'toggle-translation'): void;
  (e: 'toggle-audio-player'): void;
  (e: 'toggle-sidebar'): void;
  (e: 'toggle-vocabulary-view'): void; // New emit
  (e: 'toggle-wordbook-view'): void; // New emit
}>();

const isNavbarVisible = ref(false);


const handleScroll = () => {
  const currentScrollY = window.scrollY;
  // Show the navbar if scrolled past a certain threshold, and keep it there.
  isNavbarVisible.value = currentScrollY > 250;
};

const scrollToSection = (selector: string) => {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <nav class="smart-navbar" :class="{ 'is-visible': isNavbarVisible }">
    <div class="navbar-container">
      <div class="navbar-items">
        <a @click.prevent="scrollToSection('#article')">Article</a>
        <a @click.prevent="scrollToSection('#summary')">Core</a>
        <a @click.prevent="scrollToSection('#critical-review')">Review</a>
        <span @click="emit('toggle-translation')" class="action-toggle" id="translation-toggle">
          {{ showTranslation ? 'Original' : 'Translation' }}
        </span>
        <span @click="emit('toggle-vocabulary-view')" class="action-toggle" id="vocab-toggle">
          Vocab
        </span>
        <span @click="emit('toggle-wordbook-view')" class="action-toggle" id="wordbook-toggle">
          Wordbook
        </span>
      </div>
      <button v-if="isMobile" class="hamburger-menu" @click="emit('toggle-sidebar')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>
    <div class="reading-progress-bar" :style="{ width: readingProgress + '%' }"></div>
  </nav>
</template>

<style scoped>
.smart-navbar {
  background-color: color-mix(in srgb, var(--background-color) 90%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out, background-color 0.3s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.smart-navbar.is-visible {
  transform: translateY(0);
}

.navbar-container {
  display: flex;
  justify-content: space-between; /* Align items and hamburger */
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  height: 60px;
}

.navbar-items {
  display: flex;
  align-items: center;
  gap: 30px; /* Consistent gap for all items */
}

.navbar-items a {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--meta-text-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.navbar-links a:hover {
  color: var(--text-color);
}

.action-toggle {
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--meta-text-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.4em;
  transition: color 0.2s;
}
.action-toggle:hover {
  color: var(--text-color);
  text-decoration: none;
}

.hamburger-menu {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--text-color);
}

.reading-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(to right, color-mix(in srgb, var(--accent-color) 50%, white), var(--accent-color));
  transition: width 0.1s linear;
  z-index: 101;
}

@media (max-width: 1023px) {
  .navbar-container {
    padding: 0 15px;
    height: 56px;
  }
  .navbar-items {
    width: 100%;
    justify-content: space-around;
    gap: 10px;
  }
  .navbar-items a,
  .navbar-items .action-toggle {
    font-size: 14px;
  }

  #vocab-toggle,
  #wordbook-toggle,
  .hamburger-menu {
    display: none;
  }
}
</style>
