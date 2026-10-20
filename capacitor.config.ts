import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maagogasagency',
  appName: 'Maa Gogas Agency',
  webDir: 'out',
  server: {
    url: 'https://maa-gogas-agency.vercel.app/',
    cleartext: true,
  }
};

export default config;
