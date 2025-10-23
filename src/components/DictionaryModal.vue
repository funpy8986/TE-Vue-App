<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { SavedWord, Phonetic } from '../types';

const props = defineProps<{
  word: string;
  addWordToBook: (word: SavedWord) => void; // New prop
  triggerToast: (message: string) => void; // New prop
  savedWords: SavedWord[]; // New prop
  removeWordFromBook: (word: string) => void; // New prop
}>();

const emit = defineEmits<{
  (e: 'close'): void
}>();

const isLoading = ref(false);
const error = ref<string | null>(null);
const definition = ref<any>(null);

const isWordSaved = computed(() => {
  return definition.value && props.savedWords.some(w => w.word === definition.value.word);
});

const popState = ref(0);

const audioUrl = computed(() => {
  if (!definition.value || !definition.value.phonetics) return null;
  const phoneticWithAudio = definition.value.phonetics.find((p: Phonetic) => p.audio);
  return phoneticWithAudio ? phoneticWithAudio.audio : null;
});

const playAudio = () => {
  if (audioUrl.value) {
    new Audio(audioUrl.value).play().catch(err => console.error("Audio play failed:", err));
  }
};

const searchWord = async (word: string) => {
  if (!word) return;
  isLoading.value = true;
  error.value = null;
  definition.value = null;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) {
      throw new Error('Definition not found.');
    }
    const data = await response.json();
    definition.value = data[0]; // Use the first result
  } catch (e: any) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
};

const handleSaveWord = () => {
  if (definition.value) {
    popState.value++; // Trigger animation
    if (isWordSaved.value) {
      props.removeWordFromBook(definition.value.word);
      props.triggerToast(`'${definition.value.word}' 已从生词本中移除！`);
    } else {
      props.addWordToBook(definition.value);
      props.triggerToast(`'${definition.value.word}' 已添加到生词本！`);
    }
  }
};

// Watch for the 'word' prop to change and trigger a new search
watch(() => props.word, (newWord) => {
  searchWord(newWord);
}, { immediate: true });

</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container">
      <button class="modal-close-btn" @click="emit('close')">&times;</button>
      <div id="modal-content">
        <div v-if="isLoading" class="loader"></div>
        <div v-else-if="error">
          <h3>Error</h3>
          <p>Sorry, we couldn't find a definition for <strong>"{{ props.word }}"</strong>.</p>
        </div>
        <div v-else-if="definition">
          <div class="modal-header">
            <h3>{{ definition.word }}</h3>
            <p class="phonetic">{{ (definition.phonetics.find((p: Phonetic) => p.text) || {}).text }}</p>
            <button v-if="audioUrl" @click="playAudio" class="audio-btn" title="Listen">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </button>
            <button v-if="definition" @click="handleSaveWord" class="save-word-btn" :title="isWordSaved ? '从生词本中移除' : '保存到生词本'">
              <svg v-if="isWordSaved" :key="popState" class="animate-pop" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              <svg v-else :key="popState" class="animate-pop" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>
          <div v-for="(meaning, index) in definition.meanings" :key="index" class="definition-group">
            <p class="part-of-speech">{{ meaning.partOfSpeech }}</p>
            <p class="definition-text">{{ meaning.definitions[0].definition }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pop-animation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.animate-pop {
  animation: pop-animation 0.3s ease-out;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  display: flex; /* Use flex to center */
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 15px;
}

.modal-container {
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  padding: 25px;
  border: 1px solid var(--border-color);
}

.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
  color: var(--meta-text-color);
  line-height: 1;
  padding: 5px;
}
.modal-close-btn:hover {
  color: var(--text-color);
}

.modal-header {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px 15px;
  margin-bottom: 20px;
}

#modal-content h3 {
  font-family: var(--font-sans);
  font-size: 26px;
  font-weight: 700;
  margin: 0;
}

#modal-content .phonetic {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--meta-text-color);
  font-size: 16px;
  margin: 0;
}

.audio-btn, .save-word-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--accent-color);
  line-height: 1;
  margin-left: 5px; /* Add some spacing */
}

#modal-content .definition-group {
  margin-bottom: 20px;
}

#modal-content .part-of-speech {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 15px;
  color: var(--accent-color);
  margin-bottom: 8px;
}

#modal-content .definition-text {
  font-family: var(--font-serif);
  font-size: 16px;
  line-height: 1.7;
}

.loader {
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
