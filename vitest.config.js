import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // src/ — full 100% threshold enforced (all business logic lives here)
      // bin/ — included in report but excluded from thresholds:
      //   bin/create.js is an interactive CLI entry point with top-level await;
      //   it is tested end-to-end via the smoke test in Task 10, not by unit tests.
      include: ['src/**/*.js', 'bin/**/*.js'],
      thresholds: {
        'src/**/*.js': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  },
});
