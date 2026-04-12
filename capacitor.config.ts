import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.checkrezerve.app',
  appName: 'CheckRezerve',
  webDir: 'out',
  server: {
    url: 'https://checkrezerve.com',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
