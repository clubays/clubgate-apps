import { ClubgateError } from '@clubays/clubgate-sdk';

export const SCOPE_LABELS = {
  'user.read': 'Your name and photo',
  'profile.read': 'Your public profile',
  'identity.read': 'Your username and profile id',
};

const ERRORS = {
  consent_declined: 'You chose not to connect. You can connect any time.',
  not_embedded: 'Open this app from Clubays to use it.',
  timeout: 'Clubays took too long to respond. Try again.',
  rate_limited: 'Too many requests. Wait a moment and try again.',
  app_suspended: 'This app is currently unavailable.',
  scope_denied: 'This app does not have permission to do that.',
  link_revoked: 'Your connection was removed. Connect again to continue.',
};

export const errorCode = (e) =>
  e instanceof ClubgateError ? e.code : e?.message || 'unknown_error';

export const errorText = (code) =>
  ERRORS[code] || 'Something went wrong. Try again.';
