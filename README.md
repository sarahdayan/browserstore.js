# BrowserStore

BrowserStore helps you persist data into various browser-based storage systems. It offers a unified interface on top of your favorite storage systems and makes it simple to persist data without worrying about implementation details.

It also lets you plug several storage systems at once, sync data between them, and retrieve data from them with the order strategy of your choice.

## Download/install

BrowserStore provides builds for different environments.

The recommended way of install is via [npm][npm] or [Yarn][yarn]:

```bash
npm install browserstore

// or

yarn add browserstore
```

### UMD (browser global)

Include BrowserStore in a script tag and access its methods through the global `browserstore` variable.

```html
<script src="path/to/umd/browserstore.js"></script>
```

### CommonJS (Node)

```js
const adapters = require('browserstore/adapters')
const { createStore } = require('browserstore')
```

### AMD (RequireJS, SystemJS, etc.)

```js
requirejs(['path/to/amd/browserstore'], function(browserstore) {
  //...
})
```

### ES modules (modern browsers, Webpack, etc.)

```js
import * as adapters from 'browserstore/adapters'
import { createStore } from 'browserstore'
```

### The architecture of BrowserStore

BrowserStore is built with modularity in mind. Yet, this isn't always practical depending on your use case and your environment. For instance, if you're using a library right in the browser with a `<script>` tag, it's easier to access everything from a global namespace. However, if you're in a Node environment, or if you have a build step in your pipeline, importing the library piece by piece is much more idiomatic.

For this reason, the standard UMD and AMD builds expose the whole core library under a global `browserstore` variable. The CommonJS and ESM builds let you import only what you need (so you can leverage tree-shaking).

If you're using the standard UMD or AMD build, you need to access the core features on the `browserstore` namespace. If you're using the Node.js or ESM build, you can access them directly. **The documentation illustrates examples using the latter, but keep your own usage in mind while following it.**

**Note**: not using a build step shouldn't penalize you with extra bytes you don't need. For that reason, you also have access to lite builds. They provide atomic modules for you to import manually. The tradeoff is more HTTP calls, but you're shipping smaller files to the end users.

## Quick start

### Create a store

BrowserStore lets you wrap browser storage systems and manipulate them using a unified API. These wrappers are called **stores**. These are the entities you interact with, to which you pass options and on which you call methods.

To create a store, you need to import an adapter and wrap it into a store. Adapters are the layer that directly communicates with your browser storage. BrowserStore provides several adapters for you to use out of the box.

Here, we're importing the `localStorageAdapter` adapter (which communicates with the browser's `localStorage`) and creating a store out of it using the `createStore` factory.

```js
import localStorageAdapter from 'browserstore/adapters/localStorage'
import { createStore } from 'browserstore'

const store = createStore(localStorageAdapter)
```

In the UMD and AMD builds, adapters don't come bundled under the `browserstore` namespace, you have to import them manually.

```html
<script src="path/to/umd/adapters/localStorage.js"></script>
<script src="path/to/umd/browserstore.js"></script>
<script>
  const store = browserstore.createStore(localStorageAdapter)
</script>
```

You can now use your store to interact with your storage system.

```js
store.set('foo', 'bar') // sets value 'bar' as 'foo' in the localStorage
store.set('baz', 'quux')

store.get('foo') // returns 'bar'

store.remove('foo') // removes 'foo'

store.clear() // clears the localStorage
```

When creating a store, you can pass options. These are useful to handle more complex use cases without caring about implementation details.

For example, let's say you want to namespace the data you store, to avoid name clashes. Instead of manually doing it for every key, you can set it once and never think of it again.

```js
const store = createStore(localStorageAdapter, { namespace: 'browserstore_' })

store.set('foo', 'bar') // sets value 'bar' as 'browserstore_foo'
store.get('foo') // returns 'bar' by key 'browserstore_foo'
store.remove('foo') // removes 'browserstore_foo'
```

### Create a multi-store

The highlight of BrowserStore is its ability to create multi-stores. Multi-stores let you call methods the same way as if you were using a single store but performs it on several stores at a time.

```js
import localStorageAdapter from 'browserstore/adapters/localStorage'
import sessionStorageAdapter from 'browserstore/adapters/sessionStorage'
import { createStore, multiStore } from 'browserstore'

const stores = multiStore([
  createStore(localStorageAdapter),
  createStore(sessionStorageAdapter)
])

stores.set('foo', 'bar') // sets value 'bar' as 'foo' in the localStorage and sessionStorage
```

When retrieving data from a multi-store, BrowserStore looks them up in order. As soon as it finds data, it stops and returns it. This behavior is particularly useful if you're updating stores independently, and you want to set some hierarchy in data retrieval.

Imagine you store data in the `localStorage` and the URL. Whenever a piece of data is in the URL, it should prevail over any data the user has in its `localStorage`. For example, a user may have a language saved in their `localStorage` from a previous visit, but you want to explicitly redirect them to a page in a specific language regardless of their preferences. Without a hierarchical lookup system, you'd have to implement some imperative conditional system. With BrowserStore, you get a declarative syntax which keeps your code clean.

```js
import localStorageAdapter from 'browserstore/adapters/localStorage'
import sessionStorageAdapter from 'browserstore/adapters/sessionStorage'
import { createStore, multiStore } from 'browserstore'

const localStore = createStore(localStorageAdapter)
const urlStore = createStore(sessionStorageAdapter)

const stores = multiStore([urlStore, localStore])

stores.set('language', 'en-US') // sets 'language' in both stores
urlStore.set('language', 'fr-FR') // sets a new 'language' in the urlStore only

stores.get('language') // returns 'fr-FR', as urlStore is the first store
```

If a multi-store doesn't find a value in a store, it moves on to the next until it finds it.

## Building your own adapter

You can make your own adapter by creating an object that implements the following methods:

```js
const myStorage = {
  get: key => /* return data from storage */,
  set: (key, value) => /* persist data into storage */,
  remove: key => /* remove data from storage */,
  clear: () => /* clear storage */,
  afterGet: data => /* manipulate data after getting it */,
  beforeSet: data => /* manipulate data before setting it */
}

const myStore = createStore(myStorage)
```

### What's the point of the afterGet and beforeSet methods?

You can use the `afterGet` and `beforeSet` methods to transform data, respectively after you get data from the storage (and before returning it) and before setting data into the storage. In some cases, like with the `localStorage`, this can be useful to stringify and unstringify data.

Keeping data transformation separate from interfacing with the storage system makes things easier to test. If you don't need to transform data, don't add the `afterGet` and `beforeSet` methods to your adapter.

## How different is BrowserStore from Store.js?

[Store.js][github:store] is a fantastic project which focuses on storing data, whatever the browser of the end user. It supports older browsers (down to IE6). However, it doesn't let you sync data over several storage systems, or explore them sequentially to retrieve data. That's where BrowserStore steps in.

BrowserStore lets you store data as well, but it doesn't choose for you, you have to specify what storage you want to use. You can create single stores or multi-stores, and save data on them using the same API.

In a nutshell, Store.js and BrowserStore serve the same general purpose, but with a different approach. They solve similar and different problems.

## Acknowledgements

Design-wise, BrowserStore draws inspiration from [Luxon][luxon] and [Store.js][github:store]. Props to their author for the fantastic job they did.

## License

BrowserStore is licensed under [MIT][license].

[license]: https://github.com/sarahdayan/browserstore/blob/master/LICENSE.md
[npm]: https://www.npmjs.com
[yarn]: https://yarnpkg.com
[github:store]: https://github.com/marcuswestin/store.js
[luxon]: https://moment.github.io/luxon
