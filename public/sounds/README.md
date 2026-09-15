# Sound Files for SiliRual

This directory should contain audio files for elderly-friendly sound features.

## Required Sound Files:

### gentle-chime.mp3
- **Purpose**: Reminder completion sound
- **Characteristics**: 
  - Soft, gentle chime or bell sound
  - Frequency: 440-880Hz (pleasant to elderly ears)
  - Duration: 1-2 seconds
  - Volume: Moderate (not startling)
- **Usage**: Played when reminders are marked as done

### button-tap.mp3 (optional)
- **Purpose**: Button feedback sound
- **Characteristics**: Very subtle tap sound
- **Usage**: Haptic audio feedback for button presses

### success-chime.mp3 (optional)
- **Purpose**: Game/activity completion
- **Characteristics**: Positive, encouraging sound
- **Usage**: When games or activities are completed

## Audio Guidelines for Elderly Users:

1. **Frequency**: Use lower frequencies (200-2000Hz) as high-frequency hearing loss is common
2. **Volume**: Keep moderate - not too loud to startle
3. **Duration**: Keep sounds short (1-3 seconds maximum)
4. **Type**: Use natural sounds (chimes, bells) rather than synthetic beeps
5. **Clarity**: Ensure sounds are clear and distinct

## Implementation:

The web UI uses the Web Audio API for sound playback. Mobile app uses Expo Audio.

To add actual sound files:
1. Place MP3 files in this directory
2. Reference them in the code using `/sounds/filename.mp3`
3. Test on multiple devices for volume and clarity
