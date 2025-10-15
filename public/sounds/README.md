# Notification Sounds

This directory contains audio files for in-app notifications.

## Required File

- `notification.mp3` - Played when a new message arrives from a resident

## Specifications

- **Format**: MP3
- **Duration**: 1-2 seconds (short and subtle)
- **Volume**: Medium (the app sets volume to 0.5)
- **Quality**: 128kbps or higher

## Free Sound Resources

1. **Pixabay** (Free, no attribution required)
   - https://pixabay.com/sound-effects/search/notification/

2. **Freesound** (Free, Creative Commons)
   - https://freesound.org/search/?q=notification

3. **Zapsplat** (Free with account)
   - https://www.zapsplat.com/sound-effect-categories/notification-sounds/

## Recommended Sounds

Look for:
- "Gentle notification"
- "Subtle ping"
- "Soft chime"
- "Message alert"

Avoid overly loud or jarring sounds since admins may receive multiple messages.

## Implementation

The notification sound is implemented in:
- Hook: `/src/hooks/use-notification-sound.ts`
- Usage: `/src/components/dashboard/message-thread.tsx`

The sound only plays for messages where `sender_type === 'resident'` (not AI or admin messages).

Users can disable sounds via localStorage preference (`notificationSoundEnabled`).
