import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import config, { IOS_PERMISSION_STRINGS, loadBrand, readAppEnv, validateBrand } from './app.config';

const VALID_BRAND = {
  id: 'acme',
  displayName: 'Acme',
  slug: 'acme-app',
  scheme: 'acmeapp',
  ios: { bundleIdentifier: 'com.acme.app' },
  android: { package: 'com.acme.app', adaptiveIconBackgroundColor: '#ffffff' },
  colors: { brand: '#3c6df0', splashBackground: '#ffffff' },
  eas: { projectId: 'abc-123' },
};

describe('validateBrand', () => {
  test('returns a normalized BrandConfig for a fully valid brand.json', () => {
    const result = validateBrand(VALID_BRAND, 'acme');

    expect(result).toEqual({
      id: 'acme',
      displayName: 'Acme',
      slug: 'acme-app',
      scheme: 'acmeapp',
      ios: { bundleIdentifier: 'com.acme.app' },
      android: { package: 'com.acme.app', adaptiveIconBackgroundColor: '#ffffff' },
      colors: { brand: '#3c6df0', splashBackground: '#ffffff' },
      eas: { projectId: 'abc-123', owner: undefined },
    });
  });

  test('keeps a non-empty eas.owner', () => {
    const result = validateBrand(
      { ...VALID_BRAND, eas: { projectId: 'abc-123', owner: 'my-org' } },
      'acme',
    );
    expect(result.eas.owner).toBe('my-org');
  });

  test('treats an empty eas.owner as absent', () => {
    const result = validateBrand(
      { ...VALID_BRAND, eas: { projectId: 'abc-123', owner: '' } },
      'acme',
    );
    expect(result.eas.owner).toBeUndefined();
  });

  test('accepts uppercase hex colors', () => {
    const result = validateBrand(
      { ...VALID_BRAND, colors: { brand: '#0B398C', splashBackground: '#FFFFFF' } },
      'acme',
    );
    expect(result.colors.brand).toBe('#0B398C');
  });

  test('allows an empty eas.projectId (no EAS project configured yet)', () => {
    const result = validateBrand({ ...VALID_BRAND, eas: { projectId: '' } }, 'acme');
    expect(result.eas.projectId).toBe('');
  });

  test.each([
    ['id', { ...VALID_BRAND, id: '' }],
    ['displayName', { ...VALID_BRAND, displayName: undefined }],
    ['slug', { ...VALID_BRAND, slug: 123 }],
    ['scheme', { ...VALID_BRAND, scheme: '' }],
    ['ios.bundleIdentifier', { ...VALID_BRAND, ios: {} }],
    ['android.package', { ...VALID_BRAND, android: { adaptiveIconBackgroundColor: '#ffffff' } }],
    [
      'android.adaptiveIconBackgroundColor',
      { ...VALID_BRAND, android: { package: 'com.acme.app' } },
    ],
    ['colors.brand', { ...VALID_BRAND, colors: { splashBackground: '#ffffff' } }],
    ['colors.brand', { ...VALID_BRAND, colors: { ...VALID_BRAND.colors, brand: '#fff' } }],
    [
      'android.adaptiveIconBackgroundColor',
      { ...VALID_BRAND, android: { ...VALID_BRAND.android, adaptiveIconBackgroundColor: 'blue' } },
    ],
    ['colors.splashBackground', { ...VALID_BRAND, colors: { brand: '#ffffff' } }],
    ['eas.projectId', { ...VALID_BRAND, eas: {} }],
  ])('throws a message naming the missing field "%s"', (field, invalidBrand) => {
    expect(() => validateBrand(invalidBrand, 'acme')).toThrow(
      new RegExp(field.replace('.', '\\.')),
    );
  });

  test('throws for a non-object root', () => {
    expect(() => validateBrand(null, 'acme')).toThrow(/brands\/acme\/brand\.json/);
  });
});

describe('loadBrand', () => {
  let repoRoot: string;

  beforeEach(() => {
    repoRoot = mkdtempSync(join(tmpdir(), 'load-brand-test-'));
  });

  afterEach(() => {
    rmSync(repoRoot, { recursive: true, force: true });
  });

  test('reads and validates brands/<id>/brand.json', () => {
    const brandDir = join(repoRoot, 'brands', 'acme');
    mkdirSync(brandDir, { recursive: true });
    writeFileSync(join(brandDir, 'brand.json'), JSON.stringify(VALID_BRAND));

    const result = loadBrand('acme', repoRoot);
    expect(result.id).toBe('acme');
  });

  test('throws a clear error when the brand folder does not exist', () => {
    expect(() => loadBrand('missing-brand', repoRoot)).toThrow(
      /no brands\/missing-brand\/brand\.json found/,
    );
  });
});

describe('readAppEnv', () => {
  test('defaults to development when unset', () => {
    expect(readAppEnv(undefined)).toBe('development');
  });

  test.each(['development', 'preview', 'production'] as const)('accepts "%s"', (value) => {
    expect(readAppEnv(value)).toBe(value);
  });

  test('throws for an invalid value', () => {
    expect(() => readAppEnv('staging')).toThrow(/Invalid APP_ENV "staging"/);
  });
});

describe('default hitechcloudomnichannel brand', () => {
  const brand = loadBrand('hitechcloudomnichannel', __dirname);

  test('carries the HiTechCloud identity', () => {
    expect(brand.displayName).toBe('HiTechCloudOmnichannel');
    expect(brand.ios.bundleIdentifier).toBe('vn.hitechcloud.omnichannel');
    expect(brand.android.package).toBe('vn.hitechcloud.omnichannel');
    expect(brand.colors.brand.toUpperCase()).toBe('#0B398C');
  });

  test('uses the deep-link scheme the backend trusts for social sign-in', () => {
    // Must match the static `trustedOrigins` entry in the backend's packages/auth/src/server.ts.
    expect(brand.scheme).toBe('hitechcloudomnichannelapp');
  });

  test.each([
    'icon.png',
    'splash-icon.png',
    'android-icon-foreground.png',
    'android-icon-background.png',
    'android-icon-monochrome.png',
    'notification-icon.png',
  ])('ships brands/hitechcloudomnichannel/assets/%s', (file) => {
    expect(existsSync(join(__dirname, 'brands', 'hitechcloudomnichannel', 'assets', file))).toBe(
      true,
    );
  });
});

describe('resolved Expo config', () => {
  test('uses the brand icon on iOS too (no Expo default icon override)', () => {
    expect(config.icon).toBe('./brands/hitechcloudomnichannel/assets/icon.png');
    expect(config.ios?.icon).toBeUndefined();
  });

  test('never requests the microphone', () => {
    expect(config.android?.blockedPermissions).toContain('android.permission.RECORD_AUDIO');
    expect(JSON.stringify(config.plugins)).not.toMatch(/NSMicrophoneUsageDescription/);
  });

  test('localizes every iOS permission prompt into Vietnamese', () => {
    expect(Object.keys(IOS_PERMISSION_STRINGS.vi).sort()).toEqual(
      Object.keys(IOS_PERMISSION_STRINGS.en).sort(),
    );
    expect(config.locales?.vi).toEqual({ ios: IOS_PERMISSION_STRINGS.vi });
  });

  test('keeps permission strings safe for InfoPlist.strings', () => {
    // Written verbatim between double quotes, and $(PRODUCT_NAME) is not expanded there.
    for (const strings of Object.values(IOS_PERMISSION_STRINGS)) {
      for (const value of Object.values(strings)) {
        expect(value).not.toMatch(/["\\]|\$\(/);
      }
    }
  });
});
