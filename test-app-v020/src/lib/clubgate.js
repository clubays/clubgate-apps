import { init } from '@clubays/clubgate-sdk';

if (import.meta.env.VITE_HOST_ORIGIN) {
  init({ hostOrigin: import.meta.env.VITE_HOST_ORIGIN });
}
