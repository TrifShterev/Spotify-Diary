import { defineConfig } from 'cypress';
import { initPlugin as initVisualRegressionPlugin } from '@pixsame/cypress-plugin-visual-regression-diff/plugins';

export default defineConfig({
  // Stricter than the plugin defaults (1% of pixels, colour tolerance 0.1), which miss
  // low-contrast changes in our dark palette, e.g. a card's corner radius on --bg.
  // Rendering is deterministic on one machine, so any differing pixel is a real change.
  expose: {
    pluginVisualRegressionMaxDiffThreshold: 0,
    pluginVisualRegressionDiffConfig: { threshold: 0.03 },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    setupNodeEvents(on, config) {
      initVisualRegressionPlugin(on, config);
    },
  },
});
