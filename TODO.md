# TODO

All three project types scaffold and build correctly. `create-gulp-khup@1.1.6` is published.

---

## Phase 3 — Template Quality ✅ Complete

- ~~Remove vestigial `eslint-disable` comments from template task files~~ (closed [#71](https://github.com/uncleSoWise/gulp-khup/issues/71))
- ~~Remove/replace deprecated `psi` task — PSI v2 API is retired~~ (closed [#72](https://github.com/uncleSoWise/gulp-khup/issues/72))
- ~~Remove/replace unmaintained `vinyl-ftp` in web deploy task~~ (closed [#73](https://github.com/uncleSoWise/gulp-khup/issues/73))
- ~~Resolve 57 npm audit vulnerabilities — `gulp-imagemin` chain~~ → 7 remaining (0 critical) (closed [#74](https://github.com/uncleSoWise/gulp-khup/issues/74))
- ~~Add integration smoke test to CI: scaffold → `npm install` → `gulp build`~~ (closed [#75](https://github.com/uncleSoWise/gulp-khup/issues/75))

## Phase 3.5 — Security Follow-up ✅ Complete

- ~~Replace `gulp-htmlmin` with `html-minifier-terser` (2 remaining high vulns)~~ (closed [#80](https://github.com/uncleSoWise/gulp-khup/issues/80))
- Generated web project now has **0 critical, 0 high, 5 moderate** vulnerabilities

## Phase 4+ — New Features

- ~~WordPress project type: advanced theme features (block patterns, block.json, theme.json)~~ (closed [#76](https://github.com/uncleSoWise/gulp-khup/issues/76))
- Email project type: client-specific compatibility passes (see [#77](https://github.com/uncleSoWise/gulp-khup/issues/77))
- ~~`cosmiconfig` support for customizing globs~~ — closed as not planned; scaffolded projects own `globs.js` directly ([#18](https://github.com/uncleSoWise/gulp-khup/issues/18))
