import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.demo-agency.gasagency',
  appName: 'Gas Agency',
  webDir: 'out',
  server: {
    url: 'https://demo-agency-one.vercel.app/',
    cleartext: true,
  }
};

export default config;
