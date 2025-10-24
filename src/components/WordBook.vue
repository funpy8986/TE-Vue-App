<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, type ComponentPublicInstance } from 'vue';
import { useWordBookStore } from '../stores/wordBook'; // Added

const wordBookStore = useWordBookStore(); // Added

const textareaElements = new Map<string, HTMLTextAreaElement>();
let resizeObserver: ResizeObserver | null = null;

const setTextareaRef = (el: Element | ComponentPublicInstance | null, wordId: string) => {
  if (el instanceof HTMLTextAreaElement) {
    textareaElements.set(wordId, el);
  } else {
    textareaElements.delete(wordId);
  }
};

import type { SavedWord } from '../types'; // Re-added

const removeWord = (word: string) => {
  wordBookStore.removeWordFromBook(word);
};

const getPhoneticText = (word: SavedWord) => {
  const phonetic = word.phonetics.find(p => p.text);
  return phonetic ? phonetic.text : '';
};

const getAudioUrl = (word: SavedWord) => {
  const phonetic = word.phonetics.find(p => p.audio);
  return phonetic ? phonetic.audio : null;
};

const playAudio = (audioUrl: string) => {
  if (audioUrl) {
    new Audio(audioUrl).play().catch(err => console.error("Audio play failed:", err));
  }
};

const handleNoteInput = (word: string, event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  wordBookStore.updateWordNote(word, target.value);
};

onMounted(() => {
  resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const textarea = entry.target as HTMLTextAreaElement;
      const wordId = textarea.dataset.wordId;
      if (wordId) {
        const newHeight = textarea.offsetHeight;
        const word = wordBookStore.savedWords.find(w => w.word === wordId);
        if (word && newHeight !== word.noteHeight) {
          wordBookStore.updateWordNoteDimensions(wordId, newHeight);
        }
      }
    }
  });

  textareaElements.forEach(textarea => {
    resizeObserver?.observe(textarea);
  });
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

watch(() => wordBookStore.savedWords, (newWords, oldWords) => {
  if (!resizeObserver) return;

  // Unobserve old elements
  oldWords.forEach(oldWord => {
    const textarea = textareaElements.get(oldWord.word);
    if (textarea) {
      resizeObserver?.unobserve(textarea);
    }
  });

  // Observe new elements
  newWords.forEach(newWord => {
    const textarea = textareaElements.get(newWord.word);
    if (textarea) {
      resizeObserver?.observe(textarea);
    }
  });
}, { deep: true });</script>

<template>
  <div class="word-book-list">
    <p v-if="wordBookStore.savedWords.length === 0" class="empty-message">Your word book is empty. Add words from the dictionary modal!</p>
    <div v-for="word in wordBookStore.savedWords" :key="word.word" class="word-book-item">
      <div class="item-header">
        <h3>{{ word.word }}</h3>
        <p class="phonetic">{{ getPhoneticText(word) }}</p>
        <button v-if="getAudioUrl(word)" @click="playAudio(getAudioUrl(word)!)" class="audio-btn" title="Listen">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        </button>
        <button @click="removeWord(word.word)" class="remove-btn" title="Remove from Word Book">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div v-for="(meaning, index) in word.meanings" :key="index" class="meaning-group">
        <p class="part-of-speech">{{ meaning.partOfSpeech }}</p>
        <p class="definition-text">{{ meaning.definitions?.[0]?.definition }}</p>
      </div>
      <div class="notes-section">
        <h4>Notes:</h4>
        <textarea
          :ref="(el) => setTextareaRef(el, word.word)"
          :data-word-id="word.word"
          class="word-note-textarea"
          :value="word.notes || ''"
          @input="handleNoteInput(word.word, $event)"
          :style="{ height: word.noteHeight ? `${word.noteHeight}px` : 'auto' }"
          placeholder="Add your personal notes here..."
        ></textarea>
      </div>
      <p class="saved-at">Saved: {{ new Date(word.timestamp).toLocaleString() }}</p>
    </div>
  </div>
</template>

<style scoped>
.word-book-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-message {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--meta-text-color);
  text-align: center;
  padding: 20px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
}

.word-book-item {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.item-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px 10px;
  margin-bottom: 10px;
}

.item-header h3 {
  font-family: var(--font-sans);
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.item-header .phonetic {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--meta-text-color);
  font-size: 15px;
  margin: 0;
}

.audio-btn, .remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--accent-color);
  line-height: 1;
  margin-left: 5px;
}

.remove-btn {
  color: var(--meta-text-color);
}

.remove-btn:hover {
  color: var(--text-color);
}

.meaning-group {
  margin-bottom: 10px;
}

.meaning-group:last-of-type {
  margin-bottom: 0;
}

.part-of-speech {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 14px;
  color: var(--accent-color);
  margin-bottom: 4px;
}

.definition-text {
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.6;
}

.saved-at {
  font-size: 12px;
  color: var(--meta-text-color);
  text-align: right;
  margin-top: 15px;
}

.notes-section {
  margin-top: 15px;
  border-top: 1px solid var(--border-color);
  padding-top: 15px;
}

.notes-section h4 {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.word-note-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}
</style>