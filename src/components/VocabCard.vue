<script setup lang="ts">
import type { VocabItem } from '../types';

defineProps<{
  vocabulary: VocabItem;
  isActive: boolean; // Add this prop
}>();

const emit = defineEmits<{
  (e: 'go-back'): void
}>();
</script>

<template>
  <div class="vocab-item" :id="`vocab-${vocabulary.term.toLowerCase()}`" :class="{ active: isActive }">
    <button class="vocab-back-button" @click="$emit('go-back')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Go back
    </button>
    <p class="vocab-term">{{ vocabulary.term }}</p>
    <p class="vocab-etymology"><strong>Etymology:</strong> {{ vocabulary.etymology }}</p>
    <div class="vocab-details">
      <ul>
        <li><strong>Definition:</strong> {{ vocabulary.definition }}</li>
        <li><strong>Role in Text:</strong> {{ vocabulary.roleInText }}</li>
        <li><strong>Original Sentence:</strong> <blockquote v-html="vocabulary.originalSentence"></blockquote></li>
        <li v-if="vocabulary.collocations && vocabulary.collocations.length > 0">
          <strong>Collocations:</strong>
          <ul class="nested-list">
            <li v-for="collocation in vocabulary.collocations" :key="collocation">{{ collocation }}</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.vocab-item {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    position: relative; /* Needed for absolute positioning of the button */
}
.vocab-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}

.vocab-back-button {
    display: none; /* Hidden by default */
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 6px 12px;
    background-color: var(--accent-color);
    color: white;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: background-color 0.2s;
    align-items: center;
    border: none; /* Ensure it looks like the original */
}
.vocab-item.active .vocab-back-button {
    display: inline-flex; /* Show on active card */
}
.vocab-back-button:hover {
    background-color: var(--text-color);
    color: var(--background-color);
}
.nav-icon {
    width: 1em;
    height: 1em;
    margin-right: 8px;
    vertical-align: -0.15em;
    fill: currentColor;
}

.vocab-term {
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 4px;
}

.vocab-etymology {
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--meta-text-color);
    font-size: 14px;
    margin-bottom: 12px;
}

.vocab-details {
    margin-top: 16px;
}

.vocab-details ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.vocab-details > ul > li {
    padding-bottom: 14px;
}

.vocab-details > ul > li:last-child {
    padding-bottom: 0;
}

.vocab-details li strong {
    font-weight: 600;
    margin-right: 6px;
    font-family: var(--font-sans);
}

.vocab-details .nested-list {
    margin-top: 8px;
    margin-left: 20px;
}

.vocab-details .nested-list li {
    list-style: disc;
    padding-bottom: 6px;
    font-size: 15px;
}

.vocab-details blockquote {
    font-size: 15px;
    font-style: italic;
    margin: 6px 0 0 8px;
    padding: 0 0 0 12px;
    border: none;
    border-left: 2px solid var(--border-color);
    background: none;
    color: var(--meta-text-color);
}
</style>
