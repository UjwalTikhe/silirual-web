# SILIRUAL Mobile UI Plan

## Goal
Build SILIRUAL as a polished, mobile-first responsive application for elders, family members, and caregivers. The experience will follow the supplied product, feature, navigation, and design specifications, with the elder journey receiving the clearest hierarchy, largest controls, and lowest cognitive load.

## Visual direction
- Use the supplied SILIRUAL palette and Noto Sans typography as the core design system.
- Present a trustworthy Indian public-service character without making the interface institutional or clinical.
- Introduce North East India through respectful landscape photography, subtle woven-border geometry, and nature-led secondary accents; avoid decorative clutter and stereotypes.
- Keep body text near 20px, controls at least 56px tall, high contrast, clear labels, generous spacing, and calm feedback.
- Use a phone-first composition that expands gracefully on tablets and desktop while preserving an app-like centered reading width.

## What will be built

### 1. Welcome and access
- Welcome screen with North East imagery, language access, “I am Using” and “I am Helping” paths.
- Role selection for Elder, Family, and Caregiver.
- Phone/email sign-in presentation, demo OTP flow, and always-available guest continuation.
- Friendly validation and loading states.

### 2. Elder onboarding
- Four-step guided setup: language, accessibility, profile, and consent.
- Live text-size switching with Normal, Large, and Extra Large options.
- Clear progress, back navigation, labeled switches, and immediate preference updates.

### 3. Elder experience
- Today screen with connection status, personalized greeting, featured activity, games, reminders, and recent memory.
- Persistent bottom navigation for Today, Games, Memories, and Help.
- Games catalogue plus a complete playable Picture Pairs journey: introduction, instructions/audio control, play, help/pause/stop states, feedback, and result.
- Activities, reminders, routine, memories, care circle, location sharing, help, and settings screens.
- Offline/synced indicators and reassuring empty/error states.

### 4. Family experience
- Connected-elder dashboard with progress, memories, reminders, location, care circle, and settings.
- Memory submission/review presentation, reminder creation, and connection-code flow.

### 5. Caregiver experience
- Elder selector and summary dashboard.
- Alerts, factual care notes, pending memory reviews, elder list, and settings.
- Neutral, non-diagnostic language throughout.

### 6. Responsive and accessibility behavior
- Mobile-first layouts with fixed, thumb-friendly navigation and safe-area spacing.
- Tablet/desktop adaptations without turning the product into a marketing website.
- Keyboard focus, descriptive labels, reduced-motion support, visible pressed/disabled states, and no color-only status communication.
- Text and controls tested at narrow mobile widths and Extra Large text.

## Interaction and data approach
- Build a complete interactive UI prototype with representative local sample data.
- Keep guest mode and core demonstrations usable without a server connection.
- Persist role, onboarding, text-size, and basic demo state locally in the browser.
- Cloud accounts, real SMS/email delivery, private media storage, cross-device sync, notifications, and live location remain presentation-ready but are not activated because this request is specifically for the UI.

## Technical details
- Use the existing TanStack application structure and route each major screen explicitly.
- Create shared mobile shell, accessible controls, cards, status banners, and scaled text utilities.
- Keep all visual values in semantic design tokens and reusable variants.
- Use locally stored/generated app assets rather than hotlinked images; source culturally appropriate North East references before implementation.
- Add unique page metadata for every content route.
- Validate the final experience in mobile and desktop browser sizes, including navigation and the complete elder onboarding/game flow.

## Delivery order
1. Design system, shared mobile shell, imagery, and navigation.
2. Welcome, role selection, authentication, and elder onboarding.
3. Elder home and all elder sections, including one complete game.
4. Family and caregiver dashboards and supporting screens.
5. Responsive, accessibility, and interaction verification.
