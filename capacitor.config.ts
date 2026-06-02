import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kuberagency',
  appName: 'Kuber-agency',
  webDir: 'out',
  server: {
    url: 'https://kuber-agency.vercel.app/',
    cleartext: true,
  }
};

export default config;
