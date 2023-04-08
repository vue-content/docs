# Introduction

## Why vue-content?

vue-content is built to make it as simple as possible to work with content in your Vue application. There are several aspects of it, such as fetching and presenting your content in a predictive way, and making the content editable with the Live editor. There's a lot more to it, as you'll find when you go through the documentation.

## Getting started

To get up and running you first need to install `@vue-content/core` which provides a set of key features regardless of how or where you store your content. Use your favorite package manager to install it, like this:

```
npm install @vue-content/core
```

Then in your `main.js` file (or `main.ts` if you use Typescript), add the plugin like this:

```js
import { createVueContent } from '@vue-content/core'
const app = createApp(App)
app.use(
  createVueContent({
    source: contentSource // <-- explanation below 👇 
  })
)
```

`createVueContent` will install the plugin and you can provide several different options, but only `source` is actually required. 

## Content sources

When you're considering where to put your content, you'll quickly find that there's a ton of alternatives. The first decision is probably if you should store it in static files like markdown, json or yaml - or if you're going with a more traditional CMS where your client or content writers can log in and make changes without the need to involve some developer. The first approach is perfectly fine if you or some other developer will be the one updating the content, otherwise a CMS might be the preferred solution.

vue-content is designed to be agnostic of where and how the content is stored, so either way the usage looks more or less the same. The biggest difference is how you set up your content source. In these docs we'll keep it simple and use an `in-memory-source`, but please refer to the docs for your specific content source to see how to set it up.

::: info
The content source integrations are still limited, if you're missing some specific integration, please open an issue or go ahead and try to build it yourself!
:::

To set up a basic content source, you can create a file called `content.js` with the following content.

```js
import { defineContent } from '@vue-content/core/in-memory-source'

export const { useContentBlock, contentSource } = defineContent({
  msg: 'You did it!',
  innerBlock: {
    subtitle: "You're awesome 🎉"
  }
})
```

Then in `main.js`, you can import contentSource like expected.

```js
import { contentSource } from './content'
```

...and that's it! Now you can start using the content in your Vue application.