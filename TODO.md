# TODO

`create-gulp-khup@1.0.0` is live on npm. This file tracks remaining post-1.0.0 work.

Do not create a new GitHub Release until all items below are complete.

---

## Active: Post-1.0.0 Polish

### Remove legacy gulpsheet artifacts — [#53](https://github.com/uncleSoWise/gulp-khup/issues/53)
Remove `gulpfile.babel.js`, `gulp/`, `.babelrc`, `.browserslistrc`, `.editorconfig`,
`.eslintrc`, `.prettierignore`, `.prettierrc` from the repo root. Update `.nvmrc` to Node 18.

### Email project template — [#52](https://github.com/uncleSoWise/gulp-khup/issues/52)
Port the email template from the Archive (`generator-pnmg`) into `templates/email/`.
Replaces the current stub README. Includes nunjucks email layouts + gulp tasks.

### WordPress project template — [#51](https://github.com/uncleSoWise/gulp-khup/issues/51)
Build a WordPress theme development scaffold (no Archive source — built fresh).
CSS/JS/images only, deploy path targets `wp-content/themes/<slug>/`.

---

## Future (Phase 4+)

- `cosmiconfig` support for customizing globs in generated projects (see [#18](https://github.com/uncleSoWise/gulp-khup/issues/18))
