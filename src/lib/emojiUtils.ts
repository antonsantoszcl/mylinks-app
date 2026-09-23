// Apple emoji artwork extracted from the system font, packaged and maintained
// by the open-source "emoji-datasource-apple" project (used by popular emoji
// pickers such as emoji-mart). Served here from a pinned npm package version
// on jsDelivr, so — unlike GitHub "@main"/"@latest" refs — this URL can never
// break from an upstream folder restructuring.
const APPLE_EMOJI_PKG = 'emoji-datasource-apple@16.0.0';

const APPLE_CODEPOINTS: Record<string, string> = {
  '📂': '1f4c2',
  '📌': '1f4cc',
  '✅': '2705',
  '💼': '1f4bc',
  '⚙️': '2699-fe0f',
  '💻': '1f4bb',
  '🤖': '1f916',
  '⚡': '26a1',
  '📕': '1f4d5',
  '🎓': '1f393',
  '📝': '1f4dd',
  '💰': '1f4b0',
  '📈': '1f4c8',
  '🏦': '1f3e6',
  '💬': '1f4ac',
  '🛒': '1f6d2',
  '🌐': '1f310',
  '👥': '1f465',
  '🎵': '1f3b5',
  '🎬': '1f3ac',
  '🎮': '1f3ae',
  '📺': '1f4fa',
  '❤️': '2764-fe0f',
  '⭐': '2b50',
};

/** Returns the Apple Color Emoji CDN PNG URL for an emoji character. */
export function getAppleEmojiUrl(emoji: string): string {
  const known = APPLE_CODEPOINTS[emoji];
  if (known) {
    return `https://cdn.jsdelivr.net/npm/${APPLE_EMOJI_PKG}/img/apple/64/${known}.png`;
  }
  const codePoint = [...emoji]
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-');
  return `https://cdn.jsdelivr.net/npm/${APPLE_EMOJI_PKG}/img/apple/64/${codePoint}.png`;
}
