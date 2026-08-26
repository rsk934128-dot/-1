import { SoundNotificationService } from '../services/soundNotificationService';

// Web Audio API based notification chime delegator
export function playNotificationChime() {
  SoundNotificationService.playNotificationChime();
}

export { SoundNotificationService };
