import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maagogasagency',
  appName: 'Maa Gogas Agency',
  webDir: 'out',
  server: {
    url: 'https://kuber-agency.vercel.app/',
    cleartext: true,
  }
};

export default config;
