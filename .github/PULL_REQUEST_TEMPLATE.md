## What This PR Does

<!-- One sentence summary -->

**Target branch:** `main`

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to break)
- [ ] Dependency update
- [ ] Documentation / chore

## Checklist

- [ ] Commit messages follow conventions: `type: imperative subject ≤72 chars` ([cbea.ms](https://cbea.ms/git-commit/))
- [ ] `npm install --ignore-scripts --legacy-peer-deps` completes without error
- [ ] `npm audit` run — any new high/critical vulns documented with remediation path
- [ ] CHANGELOG.md updated under `## [Unreleased]` (if user-facing change, [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format)
- [ ] No hardcoded file paths — all paths reference `globs.js`
- [ ] All new `gulp.src()` pipelines use `.pipe(plumber(errorHandler))`
- [ ] All Vitest tests pass: `npm test` (Phase 2+)
- [ ] Coverage did not decrease: `npm run test:coverage` (Phase 2+)

## Related Issues

Closes #
