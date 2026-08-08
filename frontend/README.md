# QuickBite — Frontend

React (Vite) client for the QuickBite food ordering application.

## Stack
- React 19 + React Router
- Axios for API calls
- Context API for global state (Auth, Cart, Toast)
- Plain CSS with a custom design token system (no framework)

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL, e.g. `http://localhost:3000/api` |

## Scripts
```bash
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview the production build locally
```

## Project Structure
frontend/
├── src/
│ ├── api/ # Axios instance + per-resource API functions
│ ├── components/ # reusable UI components (Navbar, Footer)
│ ├── context/ # Auth, Cart, Toast providers
│ ├── hooks/ # useAuth, useCart, useToast
│ ├── layouts/ # PublicLayout, AdminLayout
│ ├── pages/
│ │ ├── public/ # Home, Menu, Cart, Checkout, etc.
│ │ ├── protected/ # Profile, Order History
│ │ └── admin/ # Dashboard, Manage Foods/Categories/Orders
│ ├── routes/ # route definitions, ProtectedRoute, AdminRoute
│ ├── styles/ # design tokens, reset, shared stylesheets
│ └── utils/ # formatCurrency, renderStars

## Design System
Colors, typography, and spacing are defined as CSS custom properties in `src/styles/variables.css`. The palette is inspired by Nigerian food culture (jollof-orange primary, plantain-green accent) rather than generic food-app defaults.

## Notable Patterns
- **`ProtectedRoute` / `AdminRoute`**: wrap route groups requiring login or admin role respectively; both check `AuthContext`'s `isLoading` state to avoid a false "logged out" flash on page refresh.
- **Cart persistence**: `CartContext` syncs to `localStorage` on every change via a `useEffect`, and restores it lazily on mount.
- **Response unwrapping**: the backend wraps every response in `{ success, message, data }` — API layer functions return the raw Axios response; consuming components access `response.data.data.<resource>`.