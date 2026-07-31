import { type Treaty, treaty } from '@elysiajs/eden';
import type { App } from 'backend/types';

// Same origin in both environments: in production the backend serves the frontend,
// in development Vite proxies the API prefix to the backend.
// The annotation is required: the inferred type isn't portable across packages.
export const api: Treaty.Create<App> = treaty<App>(window.location.origin);
