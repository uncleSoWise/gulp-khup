# TODO

All three project types scaffold and build correctly. `create-gulp-khup@1.1.6` is published.

---

## Phase 3 — Template Quality (next sprint)

- Remove vestigial `eslint-disable` comments from template task files (see [#71](https://github.com/uncleSoWise/gulp-khup/issues/71))
- Remove/replace deprecated `psi` task — PSI v2 API is retired (see [#72](https://github.com/uncleSoWise/gulp-khup/issues/72))
- Remove/replace unmaintained `vinyl-ftp` in web deploy task (see [#73](https://github.com/uncleSoWise/gulp-khup/issues/73))
- Resolve 57 npm audit vulnerabilities in generated web project — `gulp-imagemin` chain (see [#74](https://github.com/uncleSoWise/gulp-khup/issues/74))
- Add integration smoke test to CI: scaffold → `npm install` → `gulp build` (see [#75](https://github.com/uncleSoWise/gulp-khup/issues/75))

## Phase 4+ — New Features

- WordPress project type: advanced theme features (block patterns, block.json, theme.json) (see [#76](https://github.com/uncleSoWise/gulp-khup/issues/76))
- Email project type: client-specific compatibility passes (see [#77](https://github.com/uncleSoWise/gulp-khup/issues/77))
- `cosmiconfig` support for customizing globs in generated projects (see [#18](https://github.com/uncleSoWise/gulp-khup/issues/18))
