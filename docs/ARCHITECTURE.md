# Sneezr — MVP architecture

Clean structure for the Expo TypeScript app. One source of truth under `/src`.

---

## Exact folder tree

```
sneezr-app/
├── App.tsx                    # Root: renders Navigator, theme provider
├── index.ts                   # Entry (unchanged)
├── app.json
├── package.json
├── tsconfig.json
├── assets/
│   └── ...
├── docs/
│   └── ARCHITECTURE.md
└── src/
    ├── components/            # Reusable UI
    │   ├── ui/                # Primitives (Button, Card, Input…)
    │   └── ...                # Feature-specific (SneezeRow, etc.)
    ├── screens/               # Full-screen views
    │   ├── HomeScreen.tsx
    │   ├── LogScreen.tsx
    │   └── ...
    ├── services/              # Side effects & I/O
    │   ├── storage.ts         # AsyncStorage / persistence
    │   └── ...
    ├── state/                 # Global state & types
    │   ├── store.ts           # Context / reducer or Zustand
    │   ├── types.ts           # SneezeEvent, etc.
    │   └── ...
    ├── utils/                 # Pure helpers
    │   ├── date.ts
    │   └── ...
    └── theme/                 # Design tokens & styles
        ├── colors.ts
        ├── spacing.ts
        └── index.ts           # Re-export
```

---

## What goes where

| Folder        | Purpose | Examples |
|---------------|--------|----------|
| **components** | Reusable, presentational UI. No business logic. | `Button`, `Card`, `SneezeRow`, `EmptyState` |
| **components/ui** | Generic primitives used across the app. | `Button`, `Text`, `ScreenContainer` |
| **screens**   | Full-screen views. Compose components + use state/services. | `HomeScreen`, `LogScreen`, `HistoryScreen` |
| **services**  | Side effects: storage, (future) sync, notifications. One concern per file. | `storage.ts`, `exportService.ts` |
| **state**     | App-wide state, store setup, and domain types. | `store.ts`, `types.ts`, `slices/` (if you add Redux later) |
| **utils**     | Pure functions, no React, no I/O. Easy to test. | `date.ts`, `format.ts`, `validation.ts` |
| **theme**     | Colors, spacing, typography, shared StyleSheet helpers. | `colors.ts`, `spacing.ts`, `typography.ts` |

---

## File naming conventions

- **Components & screens:** `PascalCase.tsx` (e.g. `HomeScreen.tsx`, `SneezeRow.tsx`).
- **Non-React modules:** `camelCase.ts` (e.g. `storage.ts`, `date.ts`, `colors.ts`).
- **Barrel files:** `index.ts` only when re-exporting a small set from a folder (e.g. `theme/index.ts`).
- **One main component per file;** name the file after the component.

---

## Dependencies

### Add now (MVP)

- **None required.** Expo + React Native + TypeScript are enough for:
  - List + form screens
  - `AsyncStorage` (from `@react-native-async-storage/async-storage`) for local persistence — add when you implement logging.

Optional but recommended soon:

- `@react-native-async-storage/async-storage` — when you add “save sneeze events”.
- `@react-navigation/native` + `@react-navigation/native-stack` (and `react-native-screens`, `react-native-safe-area-context`) — when you add a second screen and want a proper stack.

### Add later (post-MVP)

- **State:** `zustand` or keep React Context + useReducer if you prefer minimal deps.
- **Dates:** `date-fns` or `dayjs` — only if you need formatting/relative time.
- **Charts/stats:** e.g. `react-native-chart-kit` or similar when you add analytics.
- **Export:** CSV/JSON export can be done with `expo-sharing` + `expo-file-system` when you need it.

---

## Entry and app root

- **index.ts** — Keep as-is: `registerRootComponent(App)`.
- **App.tsx** — Thin root: wrap app in theme (and state provider if needed), render the main navigator. Import screens and layout from `src/`.

Example next step for `App.tsx`:

```tsx
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './src/theme';
import { HomeScreen } from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

(Add navigation packages when you introduce a second screen.)

---

## Summary

- **Single place for app code:** `src/` with `components`, `screens`, `services`, `state`, `utils`, `theme`.
- **Naming:** PascalCase for React components/screens, camelCase for other modules.
- **Minimal deps for MVP:** add AsyncStorage when you persist events; add React Navigation when you add more than one screen.
