# BrowserStore

BrowserStore helps you persist data into various browser-based storage systems. It offers a unified interface on top of your favorite storage systems and makes it simple to persist data without worrying about implementation details.

It also lets you plug several storage systems at once, sync data between them, and retrieve data from them with the order strategy of your choice.

## Download/install

BrowserStore provides builds for different environments.

The recommended way of install is via [npm][npm] or [Yarn][yarn]:

```bash
npm install browserstore.js

// or

yarn add browserstore.js
```

### UMD (browser global)

Include BrowserStore in a script tag and access its methods through the global `browserstore` variable.

```html
<script src="path/to/umd/browserstore.js"></script>
```

### CommonJS (Node)

```js
const adapter = require('browserstore.js/cjs/adapters/path/to/adapter')
const { createStore } = require('browserstore.js')
```

### AMD (RequireJS, SystemJS, etc.)

```js
requirejs(['path/to/amd/browserstore.js'], function(browserstore) {
  //...
})
```

### ES modules (modern browsers, Webpack, etc.)

```js
import adapter from 'browserstore.js/es/adapters/path/to/adapter'
import { createStore } from 'browserstore.js'
```

## Quick start

### Create a store

BrowserStore lets you wrap browser storage systems and manipulate them using a unified API. These wrappers are called **stores**. These are the entities you interact with, to which you pass options and on which you call methods.

To create a store, you need to import an adapter and wrap it into a store. Adapters are the layer that directly communicates with your browser storage. BrowserStore provides several adapters for you to use out of the box.

Here, we're importing the `localStorageAdapter` adapter (which communicates with the browser's `localStorage`) and creating a store out of it using the `createStore` factory.

```js
import localStorageAdapter from 'browserstore.js/es/adapters/localStorage'
import { createStore } from 'browserstore.js'

const store = createStore(localStorageAdapter)
```

In the UMD and AMD builds, adapters don't come bundled under the `browserstore` namespace; you have to import them manually.

```html
<script src="path/to/umd/adapters/localStorage.js"></script>
<script src="path/to/umd/browserstore.js"></script>
<script>
  const store = browserstore.createStore(localStorageAdapter)
</script>
```

You can now use your store to interact with your storage system.

```js
store.set('userID', 12345) // sets value 'userID' as 12345 in the localStorage

store.set('user', {
  name: 'Sarah',
  id: 12345
})

store.get('userID') // returns 12345

store.remove('user') // removes 'user'

store.clear() // clears the localStorage
```

When creating a store, you can pass options. These are useful to handle more complex use cases without caring about implementation details.

For example, let's say you want to namespace the data you store, to avoid name clashes. Instead of manually doing it for every key, you can set it once and never think of it again.

```js
const store = createStore(localStorageAdapter, { namespace: 'browserstore_' })

store.set('userID', 12345) // sets value 12345 as 'browserstore_userID'
store.get('userID') // returns 12345 by key 'browserstore_userID'
store.remove('userID') // removes 'browserstore_userID'
```

### Create a multi-store

The highlight of BrowserStore is its ability to create multi-stores. Multi-stores let you call methods the same way as if you were using a single store but performs it on several stores at a time.

```js
import localStorageAdapter from 'browserstore.js/es/adapters/localStorage'
import sessionStorageAdapter from 'browserstore.js/es/adapters/sessionStorage'
import { createStore, multiStore } from 'browserstore.js'

const stores = multiStore([
  createStore(localStorageAdapter),
  createStore(sessionStorageAdapter)
])

stores.set('userID', 12345) // sets value 'userID' as 12345 in both localStorage and sessionStorage
```

When retrieving data from a multi-store, BrowserStore looks them up in order. As soon as it finds data, it stops and returns it. This behavior is particularly useful if you're updating stores independently, and you want to set some hierarchy in data retrieval.

Imagine you store data in the `localStorage` and the URL. Whenever a piece of data is in the URL, it should prevail over any data the user has in its `localStorage`. For example, a user may have a language saved in their `localStorage` from a previous visit, but you want to explicitly redirect them to a page in a specific language regardless of their preferences. Without a hierarchical lookup system, you'd have to implement some imperative conditional system. With BrowserStore, you get a declarative syntax which keeps your code clean.

```js
const localStore = createStore(localStorageAdapter)
const sessionStore = createStore(sessionStorageAdapter)

const stores = multiStore([sessionStore, localStore])

stores.set('language', 'en-US') // sets 'language' in both stores
sessionStore.set('language', 'fr-FR') // sets a new 'language' in the sessionStore only

stores.get('language') // returns 'fr-FR', as sessionStore is the first store
```

If a multi-store doesn't find a value in a store, it moves on to the next until it finds it.

If you want a certain store to only persist a subset of your data, you can leverage the `ignore` option to filter unwanted data out. This is useful when you want to set data, but not in all stores. A good example is when you're using the `urlAdapter` adapter: you may not need everything to be visible in the URL.

Alternatively, you can use the `only` option to selectively pick what to persist. This is a good alternative to `ignore` when you know exactly what you want to keep and want to filter put everything else.

```js
const localStore = createStore(localStorageAdapter, { ignore: ['password'] })
const urlStore = createStore(urlAdapter, { only: ['language'] })

const stores = multiStore([urlStore, localStore])

// sets the 'language' in the localStore
// and in the urlStore (changing the URL into yourdomain.com?language=fr-FR)
stores.set('language', 'fr-FR')

// sets 'userID' in the localStore
// but not in the urlStore (therefore does not alter the URL)
stores.set('userID', 12345)

// does not set 'password' anywhere
stores.set('password', '$3cR3t')
```

## API

### `set()`

Save data to storage.

You can pass strings, number, booleans, arrays or objects without worrying about stringifiying them first. BrowserStore handles it for you.

```js
// with a string
store.set('mode', 'dark')

// with a number
store.set('userID', 12345)

// with a boolean
store.set('desktopNotifications', false)

// with an array
store.set('wishlist', [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling'
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger'
  }
])

// with an object
store.set('user', {
  name: 'Sarah',
  id: 12345
})
```

### `get()`

Get data from storage.

If the library doesn't find anything, it returns `null`.

```js
store.get('mode') // returns 'dark'

store.get('password') // returns null
```

### `remove()`

Remove data from storage.

```js
store.remove('user') // removes 'user' from storage
```

### `clear()`

Clear all data from storage.

```js
store.clear() // removes everything from storage
```

## Options

### `namespace`

A namespace to prefix keys.

```js
const store = createStore(adapter, { namespace: 'browserstore_' })

store.set('mode', 'dark') // sets the key as 'browserstore_mode'
store.get('mode') // returns the data for key 'browserstore_mode'
```

### `ignore`

An array of keys to ignore.

```js
const store = createStore(adapter, { ignore: ['userID'] })

store.set('userID', 12345) // does not set anything
store.get('userID') // returns null
```

### `only`

An array of keys to take into account exclusively.

```js
const store = createStore(adapter, { only: ['language'] })

store.set('language', 'fr-FR') // sets 'language' in the store
store.set('password', '$3cR3t') // does not set anything

store.get('language') // 'fr-FR'
store.get('password') // returns null
```

## Building your own adapter

You can make your own adapter by creating an object that implements the following methods:

```js
const myStorage = {
  get: key => /* return data from storage */,
  set: (key, value) => /* persist data into storage */,
  remove: key => /* remove data from storage */,
  clear: () => /* clear storage */,
  afterGet: data => /* manipulate data after getting it */,
  beforeSet: data => /* manipulate data before setting it */,
  onGetError: (err, key) => /* handle errors occurring when calling `get` */,
  onSetError: (err, key, value) => /* handle errors occurring when calling `set` */,
  onRemoveError: (err, key) => /* handle errors occurring when calling `remove` */,
  onClearError: (err, key) => /* handle errors occurring when calling `clear` */,
}

const myStore = createStore(myStorage)
```

## Handling errors

### Errors in stores

BrowserStore comes with built-in error handling.
You can catch errors thrown by any of the [public methods](#api) by defining callbacks methods on your adapter (with the `onMethodNameError` naming convention).  
For example, if the `get` method throws an error, the `onGetError` method is called. 

Let's say you try to set a value into a store that uses the `localStorageAdapter`, but the `localStorage` is full: this will throw a `QuotaExceededError`.
When this happens, you might want to clear the `localStorage` so you can save values to it again.
You can do this by defining the `onSetError` method in your adapter:

```js
import localStorageAdapter from 'browserstore.js/es/adapters/localStorage'

const myLocalStorageAdapter = {
  ...localStorageAdapter,
  ...{
    onSetError(err, key, data) {
      this.clear()
      this.set(key, data)
    }
  }
}
```

### Errors in multi-stores

Like stores, multi-stores have built-in error handling methods as well. 
You can customize the behavior by passing an object as the second parameter when creating your multi-store.

```js
import localStorageAdapter from 'browserstore.js/es/adapters/localStorage'
import sessionStorageAdapter from 'browserstore.js/es/adapters/sessionStorage'
import { createStore, multiStore } from 'browserstore.js'
const stores = multiStore(
  [createStore(localStorageAdapter), createStore(sessionStorageAdapter)],
  {
    onGetError(err, key, currentStore, nextStore) {
      return nextStore.get(key)
    },
    onSetError(err, key, currentStore, nextStore) {
      currentStore.clear()
      return currentStore.set(key)
    },
    onClearError(err, currentStore, nextStore) {
      console.error(err)
    },
    onRemoveError(err, key, currentStore, nextStore) {
      console.error(err, key)
    }
  }
)
```

Each error handling callback exposes the `currentStore` (the store that threw the error) and `nextStore` (the next store in the execution chain, or `undefined` if the current store is the last in the chain).

## Using BrowserStore in different environments

BrowserStore is built with modularity in mind. Yet, this isn't always practical depending on your use case and your environment. For instance, if you're using a library right in the browser with a `<script>` tag, it's easier to access everything from a global namespace. However, if you're in a Node environment, or if you have a build step in your pipeline, importing the library piece by piece is much more idiomatic.

For this reason, the standard UMD and AMD builds expose the whole core library under a global `browserstore` variable. The CommonJS and ESM builds let you import only what you need (so you can leverage tree-shaking).

If you're using the standard UMD or AMD build, you need to access the core features on the `browserstore` namespace. If you're using the Node.js or ESM build, you can access them directly.

**Note**: not using a build step shouldn't penalize you with extra bytes you don't need. For that reason, you also have access to lite builds. They provide atomic modules for you to import manually. The trade-off is more HTTP calls, but you're shipping smaller files to the end users.

## How different is BrowserStore from Store.js?

[Store.js][github:store] is a fantastic project which focuses on storing data, whatever the browser of the end user. It supports older browsers (down to IE6). However, it doesn't let you sync data over several storage systems, or explore them sequentially to retrieve data. That's where BrowserStore steps in.

BrowserStore lets you store data as well, but it doesn't choose for you, you have to specify what storage you want to use. You can create single stores or multi-stores, and save data on them using the same API.

In a nutshell, Store.js and BrowserStore serve the same general purpose, but with a different approach. They solve similar and different problems.

## Acknowledgements

Design-wise, BrowserStore draws inspiration from [Luxon][luxon] and [Store.js][github:store]. Props to their authors for the fantastic job they did.

## License

BrowserStore is licensed under [MIT][license].

[license]: https://github.com/sarahdayan/browserstore/blob/master/LICENSE.md
[npm]: https://www.npmjs.com
[yarn]: https://yarnpkg.com
[github:store]: https://github.com/marcuswestin/store.js
[luxon]: https://moment.github.io/luxon
