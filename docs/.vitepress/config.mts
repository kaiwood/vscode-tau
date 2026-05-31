import { defineConfig } from 'vitepress';

const docsSidebar = [
  {
    text: 'Architecture',
    items: [
      { text: 'UI Language', link: '/architecture/ui-language' }
    ]
  },
  {
    text: 'Decisions',
    items: [
      { text: 'SDK over RPC', link: '/decisions/0001-sdk-over-rpc' },
      { text: 'Three-lane Model', link: '/decisions/0002-three-lane-model' },
      { text: 'Plugin UI Bridge', link: '/decisions/0003-plugin-ui-bridge' }
    ]
  }
];

export default defineConfig({
  title: 'Tauren',
  description: 'Transparent AI coding assistant for VS Code',
  appearance: true,
  themeConfig: {
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Docs', link: '/' },
      { text: 'Architecture', link: '/architecture/ui-language' },
      { text: 'Decisions', link: '/decisions/0001-sdk-over-rpc' },
      { text: 'GitHub', link: 'https://github.com/kaiwood/vscode-tauren' }
    ],
    sidebar: {
      '/architecture/': docsSidebar,
      '/decisions/': docsSidebar
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kaiwood/vscode-tauren' }
    ]
  }
});
