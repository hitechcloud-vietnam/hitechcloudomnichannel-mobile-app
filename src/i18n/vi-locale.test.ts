import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(messages)) {
    const path = `${prefix}${key}`;
    if (typeof value === 'string') {
      out.set(path, value);
    } else {
      for (const [nestedKey, nestedValue] of flatten(value, `${path}.`)) {
        out.set(nestedKey, nestedValue);
      }
    }
  }
  return out;
}

function placeholders(value: string): string[] {
  return (value.match(/\{\{[^}]+\}\}/g) ?? []).sort();
}

/** Strings that are legitimately identical in English and Vietnamese: product/channel names and
 * the internationally used "Email"/"Bot"/"Webchat" terms. Anything else identical to `en` is an
 * untranslated string. */
const SAME_AS_ENGLISH = new Set([
  'auth.email',
  'contacts.email',
  'conversations.channelEmail',
  'conversations.channelInstagram',
  'conversations.channelMessenger',
  'conversations.channelTelegram',
  'conversations.channelTiktok',
  'conversations.channelWebchat',
  'conversations.channelWhatsapp',
  'conversations.channelZalo',
  'conversations.botOnOffLabel',
  'chat.senderBot',
]);

const enMessages = flatten(en as Messages);
const viMessages = flatten(vi as Messages);

describe('vi locale', () => {
  it('has exactly the same keys as en', () => {
    expect([...viMessages.keys()].sort()).toEqual([...enMessages.keys()].sort());
  });

  it('translates every string (except brand/channel names)', () => {
    const untranslated = [...enMessages]
      .filter(([key, value]) => !SAME_AS_ENGLISH.has(key) && viMessages.get(key) === value)
      .map(([key]) => key);
    expect(untranslated).toEqual([]);
  });

  it('preserves every {{placeholder}} exactly', () => {
    const mismatched = [...enMessages]
      .filter(([key, value]) => {
        const translated = viMessages.get(key);
        return (
          translated !== undefined &&
          placeholders(translated).join('|') !== placeholders(value).join('|')
        );
      })
      .map(([key]) => key);
    expect(mismatched).toEqual([]);
  });
});
