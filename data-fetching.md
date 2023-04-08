# Data fetching

There are several different ways to fetch your content and display it in your application. Let's start with the one that is probably most familiar. 

## useContentBlock composable

When you've set up your content source, you can import the composable `useContentBlock` and use it in your components.

```html
<script setup>
import { useContentBlock } from './content'
import SkeletonLoader from './SkeletonLoader.vue'

const { block, isReady, isLoading, error } = useContentBlock()
</script>

<template>
    <div v-if="error">Something went wrong... (details in error.message)</div>
    <SkeletonLoader v-else-if="isLoading" />
    <h1 v-else-if="isReady">{{ block.msg }}</h1>
</template>
```

In this example, useContentBlock returns the root block, but you can also have nested blocks inside each other.

```html
<script setup>
import { onMounted, ref } from 'vue'
import { useContentBlock } from './content'

const innerBlock = ref()
onMounted(async () => {
    // Note how useContentBlock is awaited, and therefor returning the block itself once fetched
    const parent = await useContentBlock()
    innerBlock.value = await useContentBlock({
        parent,
        field: "innerBlock"
    })
})
</script>

<template>
    <h2 v-if="innerBlock">{{ innerBlock.subtitle }}</h2>
</template>
```

::: info
`useContentBlock` can be called with or without await. Without await you get a promise that can be destructured to access the properties `{ block, isReady, isLoading, error }`. All of them are refs and the value of block and error will be undefined until the block is loaded or failed. Some may think it's confusing and some may think it's genius.
:::


## ContentBlock component

vue-content registers a global component called `ContentBlock` that can be used to provide your content inside of your template tags. Let's start with a simple example.

```html
<template>
    <ContentBlock v-slot="{ block, isReady, isLoading, error }">
        <h1>{{ block.msg }}</h1>
    </ContentBlock>
</template>
```

Nothing inside the default slot will be shown until the block is loaded. You can use the slot `loading` to display a loading state until the content is properly fetched.

```html
<template>
    <ContentBlock v-slot="{ block }">
        <template #loading>maybe show a spinner or something here?</template>
        <h1>{{ block.msg }}</h1>
    </ContentBlock>
</template>
```

Instead of destructuring you can also name the slot props. It can be useful when working with multiple blocks in the same component.

```html
<template>
    <ContentBlock v-slot="root">
        <ContentBlock field="innerBlock" v-slot="inner">
            <h1 v-if="root.isReady">{{ root.block.msg }}</h1>
            <h2 v-if="inner.isReady">{{ inner.block.subtitle }}</h2>
        </ContentBlock>
    </ContentBlock>
</template>
```


## Directives

The recommended way to fetch and display your content is using directives in combination with the ContentBlock component. It's pretty similar to how [v-text](https://vuejs.org/api/built-in-directives.html#v-text) and [v-html](https://vuejs.org/api/built-in-directives.html#v-html) works, but instead of passing in a variable or javascript expression, you pass in the block field you want to use.

```html
<template>
    <ContentBlock>
        <!-- these variants give the same result -->
        <h1 v-content-text="'msg'"></h1>
        <h1 v-content-text:msg></h1>
        <h1 v-content-text="{ field: 'msg' }"></h1>
        
        <!-- or if you need to use another block than the closest parent -->
        <h1 v-content-text="{ block: anotherBlock, field: 'msg' }"></h1>
    </ContentBlock>
</template>
```

The available directives are `v-content-text` and `v-content-html` (or `v-c-text` and `v-c-html` if you prefer conciseness over expressiveness).

## Formatting and sanitization

Inserting raw html into your website can easily lead to [Cross site scripting (XSS)](https://owasp.org/www-community/attacks/xss/) which is very bad. To prevent that, vue-content will always sanitize your html before inserting it when using the `v-content-html` directive. You can use modifiers to specify which html tags you want to allow. This way, you can at the same time restrict what kind of formatting to allow, making the output more predictable. For example, you may have sections where you don't want to allow h1 or h2 to be added, to avoid breaking the layout. Or you may want to allow only the very most basic formatting like bold, italic and underline, but not links or lists etc. Tags that are not allowed will be stripped out, but the text itself will be left intact. That means that `<h1>Title</h1>` will become `Title` if `h1` is not allowed.

The syntax to set allowed html tags is simply to add each tag as a modifier to the directive. Please keep reading about presets before waving off the syntax as way to verbose!

```html
<template>
    <ContentBlock>
        <!-- only allow very basic formatting with b, u and i tags -->
        <h1 v-content-html:msg.b.i.u></h1>

        <!-- allow paragraphs with basic formatting, links, lists and specific headings -->
        <div v-content-html:longerText.p.b.i.u.a.li.ol.h3.h4></div>

        <!-- the same settings as previous div, but with a preset (described below) -->
        <div v-content-html:longerText.article></div>
    </ContentBlock>
</template>
```

### Tag presets

Of course you don't want to specify each and every html element every time you use the directive, so vue-content is giving you a way to set up presets. The following presets are provided by default, but can easily be extended to fit your needs.

```js
presets: {
    default: ['h1', 'h2', 'basic', 'p', 'a'],
    plain: [],
    basic: ['i', 'u', 'b'],
    lists: ['ol', 'ul'],
    ol: ['ol', 'li'],
    ul: ['ul', 'li']
}
```

You can create you own presets and pass them as options to `createVueContent`. Note that you can mix and match presets and html tags as you like.

```js
// in main.js
app.use(createVueContent({
    source: contentSource,
    tags: {
        presets: {
            article: ['basic', 'lists', 'p', 'a', 'h3', 'h4']
        }
    }
}))
```

### sanitize function

If you're not using the directive `v-content-html` you need to explicitly sanitize and format the html with `sanitize`.

```js
import { useContent } from '@vue-content/core'

const { sanitize } = useContent()
const block = await useContentBlock()
const msg = sanitize(block.msg, { 
})
```


## Variables

Chances are you need to reference some kind of dynamic values from within your content. The syntax is inspired by Vue template mustaches but with some limitations.

```js
// in content.js
const content = {
    countButton: "Count is {{ count }}"
}
```

```html
<script setup>
// YourComponent.vue
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
    <ContentBlock>
        <button v-content-text:countButton @click="count++"></button>
    </ContentBlock>
</template>
```

Note how directives can "read" refs, props, computed and reactives from the component that uses them. If you want to be more explicit about what is happening, you can also pass variables as the argument. This also gives you a chance to rename them or make more complex conditions before passing them into the content.

```html
<script setup>
// YourComponent.vue
import { ref, computed } from 'vue'
const count = ref(0)
const doubleCount = computed(() => count.value * 2)
</script>

<template>
    <ContentBlock>
        <button
          v-content-text:countButton="{
            count,        // <- not really needed, but can be used for clarity 
            doubleCount,  // <- not really needed, but can be used for clarity 
            limitedCount: count > 5 ? 5 : count
          }" 
          @click="count++"
        ></button>
    </ContentBlock>
</template>
```

You probably want to make limitedCount a computed too in this case, this is only to demonstrate what's possible.

::: info
Try to keep variables as simple as possible in the content itself. Ternaries, conditionals etc. are not supported, that should be handled in the code. Think of the mustaches as placeholders in the content, not actual code.
:::


### Accessing stores

If you're using some kind of stores, like [pinia](https://pinia.vuejs.org/) for example, you can register and use them like any other variables.

```js
// in main.js
import { useCounterStore } from './stores/counter'
app.use(createVueContent({
    source: contentSource,
    stores: {
        counterStore: useCounterStore()
    }
}))
```

```js
// in content.js
const content = {
    countButton: "Count is {{ counterStore.count }}"
}
```


### replaceVariables function

If not using the directives you need to explicitly replace variables yourself. This is done by using the utility function `replaceVariables` exposed by the `useContent` composable.

```js
import { useContent } from '@vue-content/core'

const { replaceVariables } = useContent()
const block = await useContentBlock()
const msg = replaceVariables(block.msg, { 
    count: count.value,
    counterStore: useCounterStore()
})
```