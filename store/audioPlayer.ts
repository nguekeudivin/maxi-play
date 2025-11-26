// utils/audioPlayer.ts
import { Audio } from "expo-av";

class AudioPlayer {
  private static instance: AudioPlayer;
  private sound: Audio.Sound | null = null;

  private constructor() {}

  static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  getSound() {
    return this.sound;
  }

  setSound(sound: Audio.Sound | null) {
    this.sound = sound;
  }

  async unload() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

export default AudioPlayer.getInstance();
