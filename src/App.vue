<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'; // Added type Ref and watch
import ArticleSkeleton from './components/ArticleSkeleton.vue';
import VocabCard from './components/VocabCard.vue';
import DictionaryModal from './components/DictionaryModal.vue';
import WordBook from './components/WordBook.vue';
import Navbar from './components/Navbar.vue';
import AudioPlayer from './components/AudioPlayer.vue'; // Import custom audio player
import { useWordBookStore } from './stores/wordBook';
import { useUiStore } from './stores/ui';
import { useToastStore } from './stores/toast';

// Composables
import { useTheme } from './composables/useTheme';
import { useTranslationToggle } from './composables/useTranslationToggle';
import { useAudioPlayerToggle } from './composables/useAudioPlayerToggle';
import { useSidebar } from './composables/useSidebar';
import { useArticleData } from './composables/useArticleData';
import { useClickableTerm } from './composables/useClickableTerm';
import { useScrollPersistence } from './composables/useScrollPersistence';
import { useReadingTime } from './composables/useReadingTime';
import { useReadingProgress } from './composables/useReadingProgress'; // Import useReadingProgress

// --- Transition Hooks for expanding translation ---
const onEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = 'auto';
  const height = getComputedStyle(htmlEl).height;
  htmlEl.style.height = '0';
  // Force repaint before starting the transition
  getComputedStyle(htmlEl);
  setTimeout(() => {
    htmlEl.style.height = height;
  });
};

const onAfterEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = 'auto';
};

const onLeave = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = getComputedStyle(htmlEl).height;
  // Force repaint to make sure the animation is triggered correctly.
  getComputedStyle(htmlEl);
  setTimeout(() => {
    htmlEl.style.height = '0';
  });
};

// --- Dictionary Modal Logic ---
const isModalVisible = ref(false);
const selectedWord = ref('');
const handleTextSelection = () => {
  const selection = window.getSelection();
  const text = selection?.toString().trim().toLowerCase();
  console.log('handleTextSelection triggered. Selected text:', text);
  console.log('Selection object:', selection);

  if (text && text.length > 1 && text.split(' ').length === 1) {
    selectedWord.value = text;
    isModalVisible.value = true;
    console.log('Modal should be visible for word:', selectedWord.value);
  } else {
    console.log('Conditions not met for modal:', text);
  }
};

const closeModal = () => {
  isModalVisible.value = false;
};

const articleSectionRef = ref<HTMLElement | null>(null); // Added

// Store calls
const uiStore = useUiStore(); // Added
const toastStore = useToastStore(); // Added
const wordBookStore = useWordBookStore(); // Re-added

// Composable calls
const { theme, toggleTheme } = useTheme();
const { showTranslation, toggleTranslation } = useTranslationToggle();
const { showAudioPlayer, toggleAudioPlayer } = useAudioPlayerToggle();
watch(showAudioPlayer, (newValue) => {
  console.log('showAudioPlayer state changed to:', newValue);
});
const { isSidebarOpen, isMobile, toggleSidebar, openSidebar } = useSidebar();
const { article, loading, error } = useArticleData();
const { activeVocabTerm, handleArticleClick, handleGoBack } = useClickableTerm(isMobile, uiStore, openSidebar, toggleSidebar, articleSectionRef); // Updated
const { restoreScrollPosition } = useScrollPersistence(() => !!article.value);
const { estimatedReadingTime } = useReadingTime(article);
const { readingProgress } = useReadingProgress(() => !!article.value); // Use useReadingProgress

watch(article, (newArticle) => {
  console.log('App.vue: Article data changed:', newArticle);
  console.log('App.vue: Estimated Reading Time:', estimatedReadingTime.value);
}, { immediate: true });

onMounted(() => {
  // Restore scroll position after article content is rendered
  nextTick(() => {
    // Add a small delay to ensure all content is rendered and layout is stable
    setTimeout(() => {
      restoreScrollPosition();
    }, 100); // 100ms delay
  });
});
</script>

<template>
  <ArticleSkeleton v-if="loading" />
  <div v-else-if="error" class="error-container">
    <p>Error loading article: {{ error }}</p>
  </div>
  <div v-else-if="article" class="container" :class="{ 'sidebar-open': isSidebarOpen && isMobile }">
    <Navbar
      :theme="theme"
      :show-translation="showTranslation"
      :show-audio-player="showAudioPlayer"
      :active-sidebar-view="uiStore.activeSidebarView"
      :is-mobile="isMobile"
      :reading-progress="readingProgress"
      @toggle-theme="toggleTheme"
      @toggle-translation="toggleTranslation"
      @toggle-audio-player="toggleAudioPlayer"
      @toggle-vocabulary-view="uiStore.toggleSidebarView('vocabulary')"
      @toggle-wordbook-view="uiStore.toggleSidebarView('wordbook')"
      @toggle-sidebar="toggleSidebar"
    />
    <div v-if="isSidebarOpen && isMobile" class="sidebar-overlay" @click="toggleSidebar"></div>
    <main>
      <header class="page-header">
        <div class="header-top-row">
          <h1>{{ article.title }}</h1>
        </div>

        <p class="subtitle">{{ article.subtitle }}</p>
        <div class="source-meta">
          <span>Source: {{ article.source }}</span>
          <span v-if="estimatedReadingTime" class="reading-time-display">{{ estimatedReadingTime }} min read</span>
          <button @click="toggleTheme" class="theme-toggle-icon">
            <svg v-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
        </div>
      </header>

      <section id="article" ref="articleSectionRef">
        <div v-if="article.audioUrl" class="listen-to-article-block">
          <button @click="toggleAudioPlayer" class="listen-to-article-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
            <span>Listen to Article</span>
          </button>
        </div>
        <div class="article-body" @click="handleArticleClick" @mouseup="handleTextSelection" @touchend="handleTextSelection">
          <div v-for="(p, index) in article.paragraphs" :key="index" class="paragraph-pair">
            <p class="lang-en" v-html="p.en"></p>
            <Transition
              name="expand"
              @enter="onEnter"
              @after-enter="onAfterEnter"
              @leave="onLeave"
            >
              <p v-if="showTranslation" class="lang-zh">{{ p.zh }}</p>
            </Transition>
          </div>
        </div>
      </section>

      <section id="summary">
        <h2>Core Ideas</h2>
        <div class="summary-list">
          <ul>
            <li v-for="(point, index) in article.summaryPoints" :key="index" v-html="point"></li>
          </ul>
        </div>
      </section>

      <section id="critical-review">
        <h2>Critical Review</h2>
        <div class="critical-review-list">
          <ul>
            <li v-for="(point, index) in article.criticalReviewPoints" :key="index" v-html="point"></li>
          </ul>
        </div>
      </section>
    </main>

    <aside>
      <div class="sidebar-sticky-container">
        <div class="sidebar-content">
          <h2 v-show="uiStore.activeSidebarView === 'vocabulary'" id="vocab-analysis">Vocabulary Analysis</h2>
          <h2 v-show="uiStore.activeSidebarView === 'wordbook'">My Word Book</h2>
          <div class="vocab-list">
            <div v-show="uiStore.activeSidebarView === 'vocabulary'">
              <VocabCard
                v-for="vocab in article.vocabulary"
                :key="vocab.term"
                :vocabulary="vocab"
                @go-back="handleGoBack"
                :isActive="activeVocabTerm === vocab.term.toLowerCase()"
              />
            </div>
            <WordBook
              v-show="uiStore.activeSidebarView === 'wordbook'"
              :savedWords="wordBookStore.savedWords"
              @remove-word="wordBookStore.removeWordFromBook"
              @update-note="wordBookStore.updateWordNote"
              @update-note-height="wordBookStore.updateWordNoteDimensions"
            />
          </div>
        </div>
      </div>
    </aside>

    <Transition name="modal-fade">
      <DictionaryModal
        v-if="isModalVisible"
        :word="selectedWord"
        @close="closeModal"
      />
    </Transition>

    <div v-if="toastStore.showToast" class="toast-notification">
      {{ toastStore.toastMessage }}
    </div>
  </div>

  <Transition name="slide-up">
    <AudioPlayer v-if="showAudioPlayer && article" :src="article.audioUrl" @close="toggleAudioPlayer" />
  </Transition>
</template>

<style scoped>


.translation-toggle, .audio-toggle, .wordbook-toggle {
  cursor: pointer;
  color: var(--accent-color);
  font-weight: 600;
}
.translation-toggle:hover, .audio-toggle:hover, .wordbook-toggle:hover {
  text-decoration: underline;
}

#audio-player {
  margin-top: 20px;
}

/* Theme Toggle Switch Styles */
.theme-switch-wrapper {
    display: flex;
    align-items: center;
}
.theme-switch-label {
    font-family: var(--font-sans);
    color: var(--meta-text-color);
    font-size: 15px;
    font-weight: 500;
    margin-right: 12px;
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

.toast-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--accent-color);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 10000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  font-family: var(--font-sans);
  font-size: 15px;
  opacity: 0;
  animation: fadeinout 3s forwards;
}

.expand-enter-active,
.expand-leave-active {
  transition: height 0.4s ease-in-out, opacity 0.4s ease-in-out;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateX(-50%) translateY(100%);
}

@keyframes fadeinout {
  0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  90% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
}
</style>
