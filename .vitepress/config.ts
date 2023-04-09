import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vue-content",
  description: "The official docs for vue-content",
  cleanUrls: true,
  themeConfig: {
    outline: [2, 3],
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/introduction' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        link: '/introduction'
      },
      {
        text: 'Data fetching',
        link: '/data-fetching'
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vue-content' }
    ]
  }
})
