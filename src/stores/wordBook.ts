import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { SavedWord } from '../types';

const WORD_BOOK_KEY = 'my-word-book';

export const useWordBookStore = defineStore('wordBook', () => {
  const savedWords = ref<SavedWord[]>([]);

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
    const index = savedWords.value.findIndex(w => w.word === wordToAdd.word);
    if (index !== -1) {
      const existingWord = savedWords.value[index];
      savedWords.value[index] = { ...wordToAdd, timestamp: Date.now(), notes: existingWord!.notes || '' };
    } else {
      savedWords.value.push({ ...wordToAdd, timestamp: Date.now(), notes: '' });
    }
  };

  const removeWordFromBook = (wordToRemove: string) => {
    savedWords.value = savedWords.value.filter(w => w.word !== wordToRemove);
  };

  const updateWordNote = (wordToUpdate: string, newNote: string) => {
    const word = savedWords.value.find(w => w.word === wordToUpdate);
    if (word) {
      word.notes = newNote;
    }
  };

  const updateWordNoteDimensions = (wordToUpdate: string, newHeight: number) => {
    const word = savedWords.value.find(w => w.word === wordToUpdate);
    if (word) {
      word.noteHeight = newHeight;
    }
  };

  // Watch for changes in savedWords and save to localStorage
  watch(savedWords, saveWordsToLocalStorage, { deep: true });

  // Load words when the store is initialized
  loadWordsFromLocalStorage();

  return {
    savedWords,
    addWordToBook,
    removeWordFromBook,
    updateWordNote,
    updateWordNoteDimensions,
  };
});