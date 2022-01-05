import store from './lib/store.js';
import { config } from '@nbfc/shared/config.js';

import createApp from './app.js';

createApp({
  ssr: false,
});
