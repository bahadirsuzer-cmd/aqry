import type { AnonymousMode } from './anonymousFormats';
export const anonymousMessageLimit = (mode: AnonymousMode) => mode === 'confession' ? 750 : 160;
// Match PostgreSQL char_length: Unicode code points, not UTF-16 units.
export const characterCount = (text: string) => Array.from(text).length;
