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
let lastScrollY = 0;

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
        <span @click="emit('toggle-translation')" class="action-toggle">
          {{ showTranslation ? 'Original' : 'Translation' }}
        </span>
        <span @click="emit('toggle-vocabulary-view')" class="action-toggle">
          Vocab
        </span>
        <span @click="emit('toggle-wordbook-view')" class="action-toggle">
          Wordbook
        </span>
        <button v-if="isMobile" class="hamburger-menu" @click="emit('toggle-sidebar')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>
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
  justify-content: flex-start; /* Changed from space-between */
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  height: 60px;
  /* Removed gap: 40px; as navbar-items will handle spacing */
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

/* Removed .navbar-actions styles as content is now in .navbar-items */

.action-toggle {
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 15px; /* Match navbar-links a */
  font-weight: 600;
  color: var(--meta-text-color); /* Match navbar-links a */
  text-decoration: none; /* Ensure no default underline */
  display: flex;
  align-items: center;
  gap: 0.4em;
  transition: color 0.2s; /* Match navbar-links a */
}
.action-toggle:hover {
  color: var(--text-color); /* Match navbar-links a:hover */
  text-decoration: none; /* Remove underline on hover */
}

.reading-time {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--meta-text-color);
  font-weight: 500;
  margin-right: 10px;
}

.icon {
  vertical-align: -0.125em;
}

.navbar-separator {
  width: 1px;
  height: 1.2em; /* Adjust height to match text line-height */
  background-color: var(--border-color);
  margin: 0 5px; /* Adjust spacing around separator */
}

/* Copied from App.vue for consistency */
.theme-switch-wrapper {
    display: flex;
    align-items: center;
}
.theme-switch {
    display: inline-block;
    height: 24px;
    position: relative;
    width: 48px;
}
.theme-switch input {
    display:none;
}
.slider {
    background-color: #ccc;
    bottom: 0;
    cursor: pointer;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: .4s;
    border-radius: 24px;
}
.slider:before {
    background-color: #fff;
    bottom: 4px;
    content: "";
    height: 16px;
    left: 4px;
    position: absolute;
    transition: .4s;
    width: 16px;
    border-radius: 50%;
}
input:checked + .slider {
    background-color: var(--accent-color);
}
input:checked + .slider:before {
    transform: translateX(24px);
}
.theme-switch.small {
    height: 20px;
    width: 40px;
}
.theme-switch.small .slider:before {
    height: 14px;
    width: 14px;
    bottom: 3px;
    left: 3px;
}
.theme-switch.small input:checked + .slider:before {
    transform: translateX(20px);
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
  z-index: 101; /* Ensure it's above the navbar's border-bottom */
}

@media (max-width: 1023px) {
  .navbar-container {
    padding: 0 20px;
    height: 56px;
  }
  .navbar-links {
    display: none; /* Hide text links on mobile */
  }
  .hamburger-menu {
    display: block;
  }
  .action-toggle {
    font-size: 12px; /* Smaller text on mobile */
    /* Hide text labels on mobile to save space */
    font-size: 0;
  }
  .action-toggle .icon {
    font-size: 20px; /* Make icons bigger */
  }
  .navbar-actions {
    gap: 15px;
  }
  .theme-switch-wrapper {
    display: none; /* Hide theme switch on mobile navbar, can be moved to sidebar */
  }
}
</style>
