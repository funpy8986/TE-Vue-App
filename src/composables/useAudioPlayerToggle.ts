import { ref } from 'vue';

export function useAudioPlayerToggle() {
  const showAudioPlayer = ref(false);
  console.log('useAudioPlayerToggle initialized. showAudioPlayer initially:', showAudioPlayer.value);

  const toggleAudioPlayer = () => {
    showAudioPlayer.value = !showAudioPlayer.value;
    console.log('toggleAudioPlayer called. showAudioPlayer is now:', showAudioPlayer.value);
  };

  return {
    showAudioPlayer,
    toggleAudioPlayer,
  };
}