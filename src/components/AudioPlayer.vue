<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

defineProps<{
  src: string;
}>();

const audio = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.75);
const isSeeking = ref(false);

// --- Computed Properties for Display ---
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return '00:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formattedCurrentTime = computed(() => formatTime(currentTime.value));
const formattedDuration = computed(() => formatTime(duration.value));
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// --- Audio Element Event Handlers ---
const onTimeUpdate = () => {
  if (!isSeeking.value) {
    currentTime.value = audio.value?.currentTime || 0;
  }
};

const onLoadedMetadata = () => {
  duration.value = audio.value?.duration || 0;
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0; // Reset to beginning
};

// --- User Interaction Handlers ---
const togglePlayPause = () => {
  if (isPlaying.value) {
    audio.value?.pause();
  } else {
    audio.value?.play();
  }
  isPlaying.value = !isPlaying.value;
};

const handleProgressInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newTime = (parseFloat(target.value) / 100) * duration.value;
  currentTime.value = newTime;
  if (audio.value) {
    audio.value.currentTime = newTime;
  }
};

const handleVolumeInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  volume.value = parseFloat(target.value);
  if (audio.value) {
    audio.value.volume = volume.value;
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  if (audio.value) {
    audio.value.addEventListener('timeupdate', onTimeUpdate);
    audio.value.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.value.addEventListener('ended', onEnded);
    audio.value.volume = volume.value;
  }
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.removeEventListener('timeupdate', onTimeUpdate);
    audio.value.removeEventListener('loadedmetadata', onLoadedMetadata);
    audio.value.removeEventListener('ended', onEnded);
    audio.value.pause();
  }
});

</script>

<template>
  <div class="custom-audio-player">
    <audio ref="audio" :src="src" preload="metadata"></audio>

    <button @click="togglePlayPause" class="play-pause-btn">
      <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
    </button>

    <div class="time-display current-time">{{ formattedCurrentTime }}</div>

    <div class="progress-bar-container">
        <input 
            type="range" 
            min="0" 
            max="100" 
            :value="progressPercentage" 
            class="progress-slider"
            @input="handleProgressInput"
            :style="{ backgroundSize: progressPercentage + '%' }"
        />
    </div>

    <div class="time-display duration">{{ formattedDuration }}</div>

    <div class="volume-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            :value="volume" 
            class="volume-slider"
            @input="handleVolumeInput"
            :style="{ backgroundSize: volume * 100 + '%' }"
        />
    </div>
    <button @click="console.log('Close button clicked, emitting close event'); emit('close')" class="close-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  </div>
</template>

<style scoped>
.custom-audio-player {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%); /* Centering */
  max-width: 500px; /* Narrower max width for the player */
  width: calc(100% - 40px); /* Responsive width with padding */
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: color-mix(in srgb, var(--card-bg) 95%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  margin-bottom: 20px; /* Lift it from the bottom edge */
  border-radius: 12px; /* Rounded corners for card look */
}

.player-controls {
    display: flex;
    align-items: center;
    flex-grow: 1;
    gap: 15px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.custom-audio-player:hover .player-controls {
    opacity: 1;
}

.play-pause-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent-color);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--meta-text-color);
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto; /* Push close button to the right */
}
.close-btn:hover {
    color: var(--text-color);
}

.time-display {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--meta-text-color);
  min-width: 50px; /* Prevents layout shift */
  text-align: center;
}

.progress-bar-container {
  flex-grow: 1;
}

.volume-container {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--meta-text-color);
}

/* --- Custom Slider Styles --- */
input[type=range] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  cursor: pointer;
  background-image: linear-gradient(var(--accent-color), var(--accent-color));
  background-repeat: no-repeat;
}

input[type=range].volume-slider {
    width: 80px;
}

/* Thumb (the draggable circle) */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-color);
  border: 2px solid var(--card-bg);
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  margin-top: -5px; /* Center thumb vertically */
}

input[type=range]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-color);
  border: 2px solid var(--card-bg);
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
}

/* Focus styles */
input[type=range]:focus {
  outline: none;
}

input[type=range]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--card-bg), 0 0 0 5px color-mix(in srgb, var(--accent-color) 50%, transparent);
}

input[type=range]:focus::-moz-range-thumb {
    box-shadow: 0 0 0 3px var(--card-bg), 0 0 0 5px color-mix(in srgb, var(--accent-color) 50%, transparent);
}

</style>
