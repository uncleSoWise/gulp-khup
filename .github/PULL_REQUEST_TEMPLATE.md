## What This PR Does

<!-- One sentence summary -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to break)
- [ ] Dependency update
- [ ] Documentation / chore

## Checklist

- [ ] `npm install --ignore-scripts --legacy-peer-deps` completes without error
- [ ] `npm audit` run — any new high/critical vulns documented with remediation path
- [ ] CHANGELOG.md updated (if user-facing change)
- [ ] No hardcoded file paths — all paths reference `globs.js`
- [ ] All new `gulp.src()` pipelines use `.pipe(plumber(errorHandler))`
- [ ] All Vitest tests pass: `npm test` (Phase 2+)
- [ ] Coverage did not decrease: `npm run test:coverage` (Phase 2+)

## Related Issues

Closes #
