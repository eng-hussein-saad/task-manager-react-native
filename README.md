## Tasks Manager (Expo • React Native)

Cross‑platform task manager built with Expo Router and React Native. Features secure authentication, animated UI, and server‑backed CRUD with optimistic updates.

### Highlights

- Authentication: Login/Register with validations, secure token storage, and token refresh guard
- Tasks CRUD: Create, update, delete, and toggle complete via a backend API (Bearer auth)
- Optimistic UI: Smooth, instant feedback.
- Modern UX: Pull‑to‑refresh, animated list items, and post‑confirm delete animation
- Error logging: Global handlers for web/native with optional remote forwarding
- Expo Router: File‑based navigation and safe area handling

## Tech Stack

- Expo ~53 • Expo Router ~5
- React 19 • React Native 0.79
- TypeScript • Axios • expo-secure-store
- react-native-reanimated • react-native-gesture-handler

## Project Structure

```
app/
   _layout.tsx        # Root layout: error logging, auth guard, safe area
   index.tsx          # Home screen: tasks list, filters, CRUD, pull‑to‑refresh
   login.tsx          # Animated login form
   register.tsx       # Animated registration form
components/          # Reusable UI (animated task, forms, buttons, toast, etc.)
hooks/
   useTasks.ts        # Tasks state + optimistic CRUD + remote sync
   useToasts.ts       # Simple toast manager
utils/
   api.ts             # Axios instance with bearer token injection
   authApi.ts         # Auth endpoints (login/register)
   tasksApi.ts        # Tasks endpoints (GET/POST/PUT/DELETE/PATCH toggle)
   storage.ts         # Secure token persistence (expo‑secure‑store)
   errorLogger.ts     # Global error logging (web/native)
styles/commonStyles.ts# Theme and shared styles
types/Task.ts        # Task type and filter enum
```

## Backend API

The app expects a REST backend with these endpoints (JSON):

- POST auth/register → { user, token }
- POST auth/login → { user, token }
- POST auth/refresh → { token }
- GET tasks/ → RemoteTaskItem[]
- POST tasks/ → RemoteTaskItem
- PUT tasks/:id → RemoteTaskItem
- DELETE tasks/:id → 204
- PATCH tasks/:id/toggle-read → RemoteTaskItem

RemoteTaskItem shape:

```
{
   task_id: number,
   task_title: string,
   task_description: string,
   is_read: boolean,
   created_at: string,
   updated_at: string,
   user_id: number
}
```

## Configuration

Set your backend base URL in Expo config extras (preferred) or via environment:

app.json excerpt:

```
{
   "expo": {
      "extra": {
         "Backend_Url": "https://your-api.example.com/"
      }
   }
}
```

Or create a .env file at the project root with:

```dotenv
Backend_Url="https://task-manager-backend-production-8586.up.railway.app/api/"
```

Notes

- The Axios client reads Backend_Url from expo‑constants extras or process.env.
- JWT is stored under the key auth_token using expo‑secure‑store.

Backend hosting

- The production backend is hosted on Railway and available at the URL above.

## Getting Started

Optional commands to run locally:

```bash
# install deps
npm install

# start development server (Expo)
npm run start

# open on a platform (optional shortcuts shown in terminal)
# press a: Android • i: iOS • w: Web
```

Scripts

- start: expo start
- android/ios/web: platform shortcuts
- lint: run Expo lint
- reset-project: reset starter scaffolding

## Behavior & UX Notes

- Auth guard: On launch, the app checks for a stored token, probes tasks, and attempts token refresh on 401/403; otherwise routes to /login.
- Optimistic updates: Add/Update/Delete/Toggle apply immediately; failures roll back where applicable.
- Animations: Items enter with staggered motion; deletion animates after user confirms.
- Refresh: Pull‑to‑refresh reloads from the server and replaces the local list.

## Troubleshooting

- 401/403 after login: Verify Backend_Url and that the Authorization: Bearer token is accepted by your backend.
- Expo Secure Store on web: Uses an in‑memory fallback; prefer native devices or simulators for secure storage behavior.
- Metro cache issues: If you see stale code, clear cache and restart Metro.

