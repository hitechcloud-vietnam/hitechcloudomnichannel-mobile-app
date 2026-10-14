# Phát hành ứng dụng HiTechCloudOmnichannel lên App Store và Google Play

Tài liệu này dành cho đội ngũ HiTechCloud (Công ty Cổ phần Giải pháp Phần mềm Phổ Tuệ) khi phát
hành bản production của ứng dụng di động HiTechCloudOmnichannel cho thị trường Việt Nam. Quy trình
kỹ thuật chung (bằng tiếng Anh) nằm ở [deploy.md](deploy.md); tài liệu này tập trung vào những việc
cần làm theo thứ tự, và những gì HiTechCloud phải tự cung cấp.

## 1. Định danh ứng dụng

| Thuộc tính                        | Giá trị                                                                   |
| --------------------------------- | ------------------------------------------------------------------------- |
| Tên hiển thị (dưới biểu tượng)    | `HiTechCloudOmnichannel`                                                  |
| iOS bundle id / Android package   | `vn.hitechcloud.omnichannel`                                              |
| Bản TEST (`APP_ENV=preview`)      | `vn.hitechcloud.omnichannel.preview`, tên `HiTechCloudOmnichannel (Test)` |
| Bản dev (`APP_ENV=development`)   | `vn.hitechcloud.omnichannel.dev`, tên `HiTechCloudOmnichannel (Dev)`      |
| URL scheme (deep link, đăng nhập) | `hitechcloudomnichannelapp://`                                            |
| Màu thương hiệu                   | `#0B398C`                                                                 |
| Kênh OTA                          | `production` / `preview` / `development`                                  |

Tất cả nằm trong `brands/hitechcloudomnichannel/brand.json` (thương hiệu mặc định, `BRAND` không cần
đặt). Biểu tượng, splash và biểu tượng thông báo Android nằm trong
`brands/hitechcloudomnichannel/assets/`.

**Về tên hiển thị:** `HiTechCloudOmnichannel` (22 ký tự) nằm trong giới hạn 30 ký tự cho tên ứng
dụng của cả App Store và Google Play, nên giữ nguyên. Trên màn hình chính, iOS/Android chỉ hiện
khoảng 11–13 ký tự dưới biểu tượng nên tên sẽ bị rút gọn thành dạng `HiTechCloud…`. Nếu muốn tên
ngắn gọn hơn dưới biểu tượng, chỉ cần đổi `displayName` trong `brand.json` (ví dụ `HiTech Omni`) —
tên trên cửa hàng được nhập riêng trong App Store Connect / Play Console và không bị ảnh hưởng.

**Về URL scheme:** scheme được đặt là `hitechcloudomnichannelapp` để khớp với mục
`trustedOrigins` mà backend (`packages/auth/src/server.ts`) đã tin cậy cho đăng nhập Google/Facebook.
Nếu đổi scheme, phải cập nhật cả backend.

## 2. HiTechCloud cần chuẩn bị gì

Đánh dấu từng mục trước khi phát hành:

### Tài khoản

- [ ] **Tài khoản Expo** (tổ chức, ví dụ `hitechcloud`) — miễn phí; gói trả phí giúp build nhanh hơn
      và nhiều lượt build hơn. Mời các thành viên phụ trách phát hành vào tổ chức.
- [ ] **Apple Developer Program** dạng _Organization_ đứng tên Công ty Cổ phần Giải pháp Phần mềm Phổ
      Tuệ (cần số D-U-N-S, phí 99 USD/năm). Người đăng ký cần quyền Account Holder hoặc Admin.
- [ ] **Google Play Console** dạng tổ chức (phí một lần 25 USD, cần xác minh danh tính tổ chức và
      D-U-N-S).

### Thông tin xác thực (credentials) — không bao giờ commit vào repo

- [ ] **App Store Connect API key** (`.p8`, kèm Key ID và Issuer ID), vai trò _App Manager_ trở
      lên — dùng cho `eas submit` và để EAS tự quản lý chứng chỉ/provisioning profile.
- [ ] **APNs key** (`.p8`) cho thông báo đẩy iOS — EAS có thể tự tạo khi chạy
      `eas credentials -p ios` nếu đăng nhập bằng tài khoản Apple có quyền.
- [ ] **Dự án Firebase** với 3 ứng dụng Android: `vn.hitechcloud.omnichannel`,
      `vn.hitechcloud.omnichannel.preview`, `vn.hitechcloud.omnichannel.dev` → tải file
      **`google-services.json`** (một file chứa cả 3 package).
- [ ] **Service account FCM V1** (khóa JSON của dự án Firebase ở trên, quyền _Firebase Cloud
      Messaging API Admin_) — để dịch vụ Expo Push gửi được thông báo tới Android.
- [ ] **Service account Google Play** (khóa JSON trong Google Cloud, được cấp quyền _Release
      manager_ trong Play Console → Users and permissions) — để `eas submit` tải bản build lên Play.

### Hạ tầng và nội dung

- [ ] URL backend production: `API_BASE_URL` (ứng dụng builder) và `WS_URL` (máy chủ realtime
      PartyKit), cùng bộ URL cho môi trường `preview`.
- [ ] **Chính sách quyền riêng tư** bằng tiếng Việt (bắt buộc trên cả hai cửa hàng; nên tuân thủ
      Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân) và trang hỗ trợ/liên hệ.
- [ ] Nội dung cửa hàng tiếng Việt: tên (≤ 30 ký tự), phụ đề/mô tả ngắn, mô tả đầy đủ, từ khóa, ảnh
      chụp màn hình (iPhone 6.9" và 6.5", iPad nếu bật hỗ trợ iPad, điện thoại Android), biểu tượng
      512×512 và ảnh nổi bật 1024×500 cho Google Play.
- [ ] **Tài khoản demo** (email/mật khẩu, có sẵn workspace và hội thoại mẫu) cho đội ngũ duyệt của
      Apple và Google — ứng dụng bắt buộc đăng nhập nên thiếu tài khoản demo sẽ bị từ chối.
- [ ] Trả lời bảng **App Privacy** (Apple) và **Data safety** (Google): ứng dụng thu thập email,
      tên, nội dung tin nhắn, ảnh/tệp người dùng gửi, mã thiết bị nhận thông báo đẩy; không theo
      dõi quảng cáo.

### Lưu ý về chính sách duyệt ứng dụng

- **Sign in with Apple (hướng dẫn 4.8):** ứng dụng có nút đăng nhập Google và Facebook. Apple yêu
  cầu cung cấp thêm một phương thức đăng nhập bảo vệ quyền riêng tư tương đương (thường là Sign in
  with Apple), trừ khi ứng dụng thuộc diện ngoại lệ dành cho ứng dụng doanh nghiệp nơi người dùng
  đăng nhập bằng tài khoản tổ chức có sẵn. Khi nộp bản đầu tiên, hãy giải thích trong phần _App
  Review Information_ rằng đây là công cụ nội bộ cho nhân viên của doanh nghiệp đã có tài khoản
  HiTechCloudOmnichannel; nếu Apple vẫn yêu cầu, cần bổ sung Sign in with Apple ở cả backend và ứng
  dụng (hoặc ẩn đăng nhập mạng xã hội trên iOS).
- **Xóa tài khoản (hướng dẫn 5.1.1(v)):** nếu người dùng có thể tạo tài khoản qua đăng nhập mạng xã
  hội, Apple yêu cầu có cách xóa tài khoản từ trong ứng dụng hoặc qua một đường dẫn web rõ ràng.
  Chuẩn bị sẵn trang/quy trình xóa tài khoản trên web và ghi đường dẫn trong phần mô tả.
- **Mã hóa xuất khẩu:** đã khai báo `ITSAppUsesNonExemptEncryption: false` (chỉ dùng mã hóa của hệ
  điều hành), App Store Connect sẽ không hỏi lại mỗi lần tải bản build.

## 3. Bước 1 — `eas init` (một lần)

`eas.projectId` trong `brands/hitechcloudomnichannel/brand.json` **được để trống có chủ ý**: repo là
mã nguồn mở và mỗi bên triển khai dùng dự án EAS của riêng mình. Khi `projectId` trống, ứng dụng
vẫn chạy với `expo start`/Expo Go nhưng không có OTA update và không lấy được mã thông báo đẩy.

```bash
npm i -g eas-cli          # hoặc dùng npx eas-cli@latest
eas login                 # đăng nhập tài khoản Expo của HiTechCloud
# (tùy chọn) đặt "owner" trong brand.json thành slug tổ chức Expo, ví dụ "hitechcloud"
BRAND=hitechcloudomnichannel eas init
```

`eas init` tạo dự án EAS và ghi `projectId` vào `brands/hitechcloudomnichannel/brand.json` (repo
không có `app.json`). Commit thay đổi này: `projectId` không phải là bí mật.

## 4. Bước 2 — Biến môi trường trên EAS

```bash
eas env:create --environment production --name API_BASE_URL --value https://<máy-chủ-builder>
eas env:create --environment production --name WS_URL       --value https://<máy-chủ-realtime>
eas env:create --environment preview    --name API_BASE_URL --value https://<máy-chủ-builder-test>
eas env:create --environment preview    --name WS_URL       --value https://<máy-chủ-realtime-test>

# File google-services.json (biến kiểu file — EAS truyền đường dẫn file qua GOOGLE_SERVICES_JSON,
# app.config.ts tự đọc biến này)
eas env:create --environment production --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
eas env:create --environment preview    --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
```

Khi phát triển trên máy, có thể đặt `google-services.json` ở thư mục gốc repo (đã nằm trong
`.gitignore`).

## 5. Bước 3 — Credentials

```bash
# iOS: chứng chỉ phân phối, provisioning profile và APNs key — để EAS tự tạo và lưu trữ
eas credentials -p ios
#   → chọn profile "production" → "Build Credentials: Set up all..."
#   → "Push Notifications: Manage your Apple Push Notifications Key" → tạo mới hoặc tải .p8 lên
#   → "App Store Connect: Manage your API Key" → tải .p8 lên (dùng cho eas submit)

# Android: keystore ký ứng dụng + khóa FCM V1 + khóa Google Play
eas credentials -p android
#   → "Keystore: Set up a new keystore" (EAS tạo và lưu; tải bản sao lưu về nơi an toàn —
#     mất keystore nghĩa là không thể cập nhật ứng dụng trên Play nếu không bật Play App Signing)
#   → "Google Service Account" → "Push Notifications (FCM V1)" → tải khóa JSON FCM lên
#   → "Google Service Account" → "Play Store submissions" → tải khóa JSON Google Play lên
```

Nên bật **Play App Signing** (mặc định với ứng dụng mới): Google giữ khóa ký phát hành, keystore trên
EAS chỉ là khóa tải lên (upload key).

## 6. Bước 4 — Build

```bash
pnpm build:test     # bản TEST: phân phối nội bộ EAS, cài qua đường link (không qua cửa hàng)
pnpm build:prod     # bản production: .ipa cho App Store, .aab cho Google Play
```

Số build (`buildNumber`/`versionCode`) được EAS tự tăng (`appVersionSource: remote`,
`autoIncrement: true`). Phiên bản hiển thị (`version` trong `app.config.ts`, hiện `1.0.0`) do
HiTechCloud tự tăng cho mỗi đợt phát hành có thay đổi native.

## 7. Bước 5 — Nộp lên cửa hàng

### App Store

1. Trong App Store Connect, tạo ứng dụng mới với bundle id `vn.hitechcloud.omnichannel`, ngôn ngữ
   chính **Vietnamese**, danh mục _Business_.
2. Lấy **Apple ID** của ứng dụng (dãy số trong _App Information_) và thêm vào `eas.json`:

   ```json
   "submit": {
     "production": {
       "ios": { "ascAppId": "<dãy-số-apple-id>" }
     }
   }
   ```

   `ascAppId` không phải bí mật và **bắt buộc** khi nộp tự động (EAS Workflow `release`, chế độ
   non-interactive). Nếu dùng `pnpm build:testflight` cho bản TEST qua TestFlight, cần tạo thêm
   ứng dụng `vn.hitechcloud.omnichannel.preview` và điền `ascAppId` vào
   `submit.preview-testflight.ios`.

3. `pnpm submit:prod` (hoặc `eas submit -p ios --profile production`) → bản build xuất hiện trong
   TestFlight → điền thông tin cửa hàng, tài khoản demo → _Submit for Review_.

### Google Play

1. Trong Play Console, tạo ứng dụng, ngôn ngữ mặc định **Tiếng Việt – vi-VN**, loại _App_, miễn phí.
2. **Lần đầu tiên phải tải file `.aab` lên thủ công** (Google không cho API tải bản đầu tiên): tải
   artifact từ trang build trên expo.dev và tải lên track _Internal testing_.
3. Từ lần thứ hai: `pnpm submit:prod` (hoặc `eas submit -p android --profile production`). Cấu
   hình hiện tại nộp vào track `internal` với trạng thái `draft` — bắt buộc khi ứng dụng chưa từng
   được phát hành. Sau khi ứng dụng đã được duyệt và phát hành, có thể đổi `releaseStatus` thành
   `completed` trong `eas.json` để bản internal tự phát hành, rồi _promote_ lên _Production_ trong
   Play Console.
4. Hoàn thành _App content_: chính sách quyền riêng tư, Data safety, phân loại nội dung, đối tượng
   mục tiêu, quyền truy cập ứng dụng (tài khoản demo).

### Tự động hóa (EAS Workflows)

Sau khi đã có `ascAppId` và credentials đầy đủ, đẩy một tag phiên bản để build và nộp cả hai nền
tảng:

```bash
git tag v1.0.0 && git push origin v1.0.0     # chạy .eas/workflows/release.yml
```

## 8. Bước 6 — Cập nhật OTA (EAS Update)

Chỉ thay đổi JavaScript/tài nguyên (bản dịch, giao diện, logic) có thể phát hành không cần duyệt
lại:

```bash
pnpm update:prod    # eas update --channel production --environment production
pnpm update:test    # kênh preview cho bản TEST
```

`runtimeVersion` dùng chính sách `appVersion`: bản OTA chỉ đến được các bản build có cùng `version`.
**Khi thêm/nâng cấp module native hoặc đổi cấu hình native** (quyền, plugin, biểu tượng, scheme…),
phải tăng `version` trong `app.config.ts` và build + nộp lại — không phát hành OTA cho thay đổi
native. Mỗi lần push lên `main`, workflow `update.yml` tự phát hành OTA lên kênh `preview`; kênh
`production` chỉ phát hành thủ công.

## 9. Kiểm tra trước khi phát hành

```bash
pnpm install --frozen-lockfile
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
npx expo-doctor
APP_ENV=production pnpm prebuild:check   # kiểm tra cấu hình native sinh ra (thư mục ios/android bị gitignore)
```

Trên thiết bị thật (bản TEST):

- [ ] Đăng nhập email/mật khẩu, Google, Facebook (deep link `hitechcloudomnichannelapp://auth-callback`).
- [ ] Đặt ngôn ngữ thiết bị là Tiếng Việt → ứng dụng tự hiển thị tiếng Việt; đổi ngôn ngữ trong
      _Cài đặt → Ngôn ngữ_.
- [ ] Hộp thoại xin quyền máy ảnh/thư viện ảnh trên iOS hiển thị tiếng Việt.
- [ ] Nhận thông báo đẩy trên iOS và Android; chạm vào thông báo mở đúng hội thoại.
- [ ] Gửi ảnh từ máy ảnh, thư viện, tài liệu đính kèm.

## 10. Quyết định kỹ thuật đã áp dụng cho bản Việt Nam

- **Bản địa hóa:** `src/i18n/locales/vi.json` đã được dịch đầy đủ, thống nhất thuật ngữ với ứng
  dụng web (Hộp thư, Hội thoại, Liên hệ, Thẻ, Chuỗi chăm sóc, Kịch bản, Phản hồi đã lưu, Gán, Lưu
  trữ, Đa kênh, Không gian làm việc). Thiết bị có ngôn ngữ `vi`/`vi-VN` tự chọn tiếng Việt; ngày
  tháng dùng locale `vi` của dayjs (ví dụ “5 tháng 3”, “14:07”). Bài kiểm thử
  `src/i18n/vi-locale.test.ts` chặn việc thêm khóa mới mà quên dịch.
- **Chuỗi xin quyền iOS** có bản tiếng Anh và tiếng Việt (`locales` trong `app.config.ts`, sinh ra
  `vi.lproj/InfoPlist.strings`); `CFBundleAllowMixedLocalizations` giúp giao diện hệ thống hiển
  thị theo ngôn ngữ người dùng.
- **Quyền tối thiểu:** ứng dụng chỉ chụp ảnh (không quay video) nên không xin quyền micro
  (`RECORD_AUDIO` bị chặn, không có `NSMicrophoneUsageDescription`); `SYSTEM_ALERT_WINDOW` bị chặn
  ở bản phát hành; trình quét mã vạch ML Kit của `expo-camera` bị tắt. Quyền Android còn lại:
  `CAMERA`, `INTERNET`, `ACCESS_NETWORK_STATE`, `VIBRATE`, `POST_NOTIFICATIONS`,
  `RECEIVE_BOOT_COMPLETED` (thông báo), cùng `READ/WRITE_EXTERNAL_STORAGE` chỉ áp dụng cho Android
  12 trở xuống (do thư viện khai báo với `maxSdkVersion=32`; giữ lại để không ảnh hưởng việc chọn
  ảnh trên máy đời cũ).
- **Biểu tượng iOS** dùng `icon.png` của thương hiệu (trước đây trỏ tới biểu tượng mặc định của
  Expo). Thêm biểu tượng thông báo Android `notification-icon.png` (hình trắng trên nền trong suốt).
- **`google-services.json`** trên EAS được đọc qua biến `GOOGLE_SERVICES_JSON` (trước đây chỉ đọc
  file ở thư mục gốc nên bản build trên EAS sẽ thiếu FCM).
- **`eas.json`**: đã gỡ bỏ thông tin App Store Connect (Team ID, API key, Apple ID ứng dụng) còn sót
  lại từ dự án gốc; HiTechCloud điền `ascAppId` của mình theo mục 7.
