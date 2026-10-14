# Push notifications (`google-services.json`)

Android FCM V1 push delivery requires a Firebase project with this build's package name
registered, and its `google-services.json` — the file is gitignored (per-developer/CI secret, never
committed). `app.config.ts` resolves it in this order: the `GOOGLE_SERVICES_JSON` environment
variable (on EAS Build, a file-type variable whose value is the path EAS wrote the file to), then a
local `./google-services.json` at the repo root. With neither, a clean checkout still builds;
Android push registration simply won't work until it's provisioned.

The package name is brand- and environment-specific:
`<brands/BRAND/brand.json .android.package><APP_ENV suffix>` (e.g.
`vn.hitechcloud.omnichannel.preview` for the default brand's `preview`/TEST builds,
`vn.hitechcloud.omnichannel` for `production` — see `app.config.ts`'s `APP_ENV_CONFIG`). **Each
`APP_ENV` suffix needs its own entry in the Firebase project** — a single `google-services.json`
can contain multiple package names, or you can register each as a separate Android app within the
same Firebase project and merge the resulting config. Skipping this means push silently fails to
register for whichever suffix wasn't added.

For EAS builds, upload it as a
[file-type secret](https://docs.expo.dev/eas/environment-variables/#file-environment-variables)
via `eas env:create` (or the EAS dashboard) referencing the path `./google-services.json`, rather
than committing it — see [deploy.md](deploy.md#eas-environment-variables-per-brand-per-environment).
It's scoped per brand's EAS project, same as `API_BASE_URL`/`WS_URL`; a white-label customer needs
their own Firebase project registered with their own (brand-specific) package name — see
[white-label.md](white-label.md).

iOS push doesn't need an equivalent file here: Expo push notifications route through APNs using
credentials EAS manages as part of the iOS build credentials, not a bundled config file.

`google-services.json` only lets the _device_ obtain a push token. For Expo's push service to
actually _deliver_ to Android, also upload an FCM V1 service-account key for the same Firebase
project to the brand's EAS project (`eas credentials -p android` → Google Service Account → "Push
Notifications (FCM V1)"). See [release-vi.md](release-vi.md) for the full checklist.

The status-bar icon is `brands/<BRAND>/assets/notification-icon.png` (white silhouette on
transparency, 96×96) when the brand ships one; otherwise expo-notifications generates a default.
