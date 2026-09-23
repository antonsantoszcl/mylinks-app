const NOTO_CODEPOINTS: Record<string, string> = {
  '📂': '1f4c2',
  '📌': '1f4cc',
  '✅': '2705',
  '💼': '1f4bc',
  '⚙️': '2699',
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
  '❤️': '2764',
  '⭐': '2b50',
};

// Pinned to a specific commit (instead of "@main") so the icon URLs never
// break again if the upstream noto-emoji repo changes its folder structure
// (which is exactly what happened and caused all panel/section icons to
// disappear). This commit is the last one using the flat "svg/emoji_uXXXX.svg"
// layout that this app relies on.
const NOTO_EMOJI_REF = '43bac1a1272f31cedf0d74c2089fba6c7f952276';

/** Returns the Noto Color Emoji CDN SVG URL for an emoji character. */
export function getNotoEmojiUrl(emoji: string): string {
  const known = NOTO_CODEPOINTS[emoji];
  if (known) {
    return `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@${NOTO_EMOJI_REF}/svg/emoji_u${known}.svg`;
  }
  const codePoint = [...emoji]
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('_')
    .replace(/_fe0f$/, '')
    .replace(/_fe0f_/, '_');
  return `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@${NOTO_EMOJI_REF}/svg/emoji_u${codePoint}.svg`;
}
