<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import type { ArticleData, SavedWord } from './types';
import VocabCard from './components/VocabCard.vue';
import DictionaryModal from './components/DictionaryModal.vue';
import WordBook from './components/WordBook.vue';

const article = ref<ArticleData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const SAVE_KEY = 'article-scroll-position';
const WORD_BOOK_KEY = 'my-word-book';

// Debounce function to limit how often a function is called
const debounce = (func: Function, delay: number) => {
  let timeout: number;
  return function(this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const saveScrollPosition = () => {
  if (article.value) {
    localStorage.setItem(SAVE_KEY, window.scrollY.toString());
  }
};

const restoreScrollPosition = () => {
  const savedScrollY = localStorage.getItem(SAVE_KEY);
  if (savedScrollY) {
    window.scrollTo(0, parseInt(savedScrollY, 10));
  }
};

// --- Word Book Logic ---
const savedWords = ref<SavedWord[]>([]);
const showWordBook = ref(false);

const loadWordsFromLocalStorage = () => {
  const storedWords = localStorage.getItem(WORD_BOOK_KEY);
  if (storedWords) {
    try {
      savedWords.value = JSON.parse(storedWords);
    } catch (e) {
      console.error("Error parsing saved words from localStorage", e);
      savedWords.value = [];
    }
  }
};

const saveWordsToLocalStorage = () => {
  localStorage.setItem(WORD_BOOK_KEY, JSON.stringify(savedWords.value));
};

const addWordToBook = (wordToAdd: SavedWord) => {
  const existingIndex = savedWords.value.findIndex(w => w.word === wordToAdd.word);
  if (existingIndex !== -1) {
    // Update existing word, preserving notes if they exist
    savedWords.value[existingIndex] = { ...wordToAdd, timestamp: Date.now(), notes: savedWords.value[existingIndex].notes || '' };
  } else {
    savedWords.value.push({ ...wordToAdd, timestamp: Date.now(), notes: '' });
  }
};

const removeWordFromBook = (wordToRemove: string) => {
  savedWords.value = savedWords.value.filter(w => w.word !== wordToRemove);
};

const updateWordNote = (wordToUpdate: string, newNote: string) => {
  const wordIndex = savedWords.value.findIndex(w => w.word === wordToUpdate);
  if (wordIndex !== -1) {
    savedWords.value[wordIndex].notes = newNote;
  }
};

const updateWordNoteDimensions = (wordToUpdate: string, newHeight: number) => {
  const wordIndex = savedWords.value.findIndex(w => w.word === wordToUpdate);
  if (wordIndex !== -1) {
    savedWords.value[wordIndex].noteHeight = newHeight;
  }
};

const toggleWordBook = () => {
  showWordBook.value = !showWordBook.value;
};

// --- Toast Notification Logic ---
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

// --- Theme Switch Logic ---
const theme = ref<'light' | 'dark'>('light');
const setTheme = (newTheme: 'light' | 'dark') => {
  theme.value = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};
const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};

// --- Translation Toggle Logic ---
const showTranslation = ref(false);
const toggleTranslation = () => {
  showTranslation.value = !showTranslation.value;
};

// --- Audio Player Toggle Logic ---
const showAudioPlayer = ref(false);
const toggleAudioPlayer = () => {
  showAudioPlayer.value = !showAudioPlayer.value;
};

// --- Clickable Term Logic ---
const activeVocabTerm = ref<string | null>(null);

// --- Sidebar Logic ---
const isSidebarOpen = ref(false);
const isMobile = ref(window.innerWidth <= 1023);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1023;
  if (!isMobile.value) {
    isSidebarOpen.value = false; // Close sidebar when switching to desktop view
  }
};

const handleArticleClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const termElement = target.closest('.clickable-term');

  if (termElement && termElement instanceof HTMLElement) {
    const term = termElement.dataset.term;
    if (term) {
      if (isMobile.value) {
        isSidebarOpen.value = true;
      }
      const lowerCaseTerm = term.toLowerCase();
      const targetId = `vocab-${lowerCaseTerm}`;
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        activeVocabTerm.value = lowerCaseTerm; // Set active term
        // Use nextTick to ensure sidebar is open before scrolling
        nextTick(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetElement.classList.add('highlight');
          setTimeout(() => {
            targetElement.classList.remove('highlight');
          }, 2000);
        });
      }
    }
  }
};

// --- Go Back Logic ---
const handleGoBack = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false;
  }
  const articleSection = document.getElementById('article');
  if (articleSection) {
    articleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeVocabTerm.value = null; // Reset active term when going back
  }
};

// --- Dictionary Modal Logic ---
const isModalVisible = ref(false);
const selectedWord = ref('');
const handleTextSelection = () => {
  const selection = window.getSelection();
  const text = selection?.toString().trim().toLowerCase();

  if (text && text.length > 1 && text.split(' ').length === 1) {
    selectedWord.value = text;
    isModalVisible.value = true;
  }
};

const closeModal = () => {
  isModalVisible.value = false;
};

const debouncedSaveScroll = debounce(saveScrollPosition, 200);

onMounted(async () => {
  // Initialize theme
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    setTheme(savedTheme);
  } else if (userPrefersDark) {
    setTheme('dark');
  }

  loadWordsFromLocalStorage(); // Load saved words

  // Fetch article data
  try {
    const response = await fetch('/data/intel-analysis.data.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    article.value = await response.json();
    if (article.value) {

    }
    // Restore scroll position after article content is rendered
    nextTick(() => {
      // Add a small delay to ensure all content is rendered and layout is stable
      setTimeout(() => {
        restoreScrollPosition();
      }, 100); // 100ms delay
    });
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }

  // Add scroll and resize event listeners
  window.addEventListener('scroll', debouncedSaveScroll);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('scroll', debouncedSaveScroll);
  window.removeEventListener('resize', handleResize);
});

watch(savedWords, saveWordsToLocalStorage, { deep: true });
</script>

<template>
  <div v-if="loading" class="loader-container">
    <div class="loader"></div>
    <p>Loading article...</p>
  </div>
  <div v-else-if="error" class="error-container">
    <p>Error loading article: {{ error }}</p>
  </div>
  <div v-else-if="article" class="container" :class="{ 'sidebar-open': isSidebarOpen && isMobile }">
    <div v-if="isSidebarOpen && isMobile" class="sidebar-overlay" @click="toggleSidebar"></div>
    <main>
      <header class="page-header">
        <div class="header-top-row">
          <h1>{{ article.title }}</h1>
          <button v-if="isMobile" class="hamburger-menu" @click="toggleSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
        <p class="subtitle">{{ article.subtitle }}</p>
        <div class="source-meta">
          <div>
            <span>Source: {{ article.source }}</span>
            <span @click="toggleTranslation" class="translation-toggle">
              |<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon feather feather-file-text" style="margin-right: 0.2em;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>{{ showTranslation ? '原文' : '译文' }}
            </span>
                        <span @click="toggleAudioPlayer" class="audio-toggle">
                          |<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon feather feather-headphones" style="margin-right: 0.2em;"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>{{ showAudioPlayer ? '关闭' : '收听' }}
                        </span>
            <span @click="toggleWordBook" class="wordbook-toggle">
              |<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" class="icon" style="margin-right: 0.2em;">
                <path d="M1 2.828c.885-.37 2.154-.71 3.573-.884C7.456 1.158 9.467 1.5 11.318 1.7C12.613 1.867 13.45 2.13 14 2.472v11.015c-.485-.342-1.322-.605-2.617-.77C9.467 13.801 7.456 14.142 4.573 14.416c-1.419.174-2.688.514-3.573.884V2.828zm7.5 11.172c2.2.22 4.263.188 5.468-.182V2.828c-.08-.043-.109-.06-.192-.148l-.005-.005L12.1 2.568c-1.154-.17-2.362-.356-3.598-.137V14zm-6 0C2.5 14.188 3.737 14.002 4.891 13.832L5 13.828V3.362c-1.154.17-2.362.356-3.598.137V14z"/>
              </svg>{{ showWordBook ? '重点词汇' : '生词本' }}
            </span>
          </div>
           <!-- Theme Switcher -->
          <div class="theme-switch-wrapper">
            <span class="theme-switch-label">Dark mode</span>
            <label class="theme-switch small" for="theme-toggle">
              <input type="checkbox" id="theme-toggle" :checked="theme === 'dark'" @change="toggleTheme" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </header>

      <section v-if="showAudioPlayer" id="audio-player">
        <audio controls style="width: 100%; border-radius: 5px; border: 1px solid var(--border-color);">
          <source :src="article.audioUrl" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </section>

      <section id="article">
        <h2>Article Text</h2>
        <div class="article-body" @click="handleArticleClick" @mouseup="handleTextSelection">
          <div v-for="(p, index) in article.paragraphs" :key="index" class="paragraph-pair">
            <p class="lang-en" v-html="p.en"></p>
            <Transition name="fade">
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
          <h2 v-if="!showWordBook" id="vocab-analysis">Vocabulary Analysis</h2>
          <h2 v-else>My Word Book</h2>
          <div class="vocab-list">
            <VocabCard
              v-if="!showWordBook"
              v-for="vocab in article.vocabulary"
              :key="vocab.term"
              :vocabulary="vocab"
              @go-back="handleGoBack"
              :isActive="activeVocabTerm === vocab.term.toLowerCase()"
            />
            <WordBook
              v-else
              :savedWords="savedWords"
              @remove-word="removeWordFromBook"
              @update-note="updateWordNote"
              @update-note-height="updateWordNoteDimensions"
            />
          </div>
        </div>
      </div>
    </aside>

    <DictionaryModal
      v-if="isModalVisible"
      :word="selectedWord"
      @close="closeModal"
      :addWordToBook="addWordToBook"
      :triggerToast="triggerToast"
      :savedWords="savedWords"
      :removeWordFromBook="removeWordFromBook"
    />

    <div v-if="showToast" class="toast-notification">
      {{ toastMessage }}
    </div>
  </div>
</template>

<style scoped>
.loader-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.5em;
}
.loader {
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeinout {
  0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  90% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
}
</style>
