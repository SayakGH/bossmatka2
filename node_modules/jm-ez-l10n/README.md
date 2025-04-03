# jm-ez-l10n
Easy Localization for NodeJS 

## Installation
```sh
npm install jm-ez-l10n --save
```

## Configure
Load language files, in your main server.js/index.js file,

```js
var l10n = require('jm-ez-l10n');

// Set Translations by json file
l10n.setTranslationsFile('en', 'translation.en.json');
l10n.setTranslationsFile('fr', 'translation.fr.json');

// Or else by pure js object
l10n.setTranslations('en', {
    "HEL" : "Hello!",
    "INF_THANK_YOU" : "Thank you for singup with us!"
});

l10n.setTranslations('fr', {
    "HEL" : "salut!",
    "INF_THANK_YOU" : "Nous vous remercions de singup avec nous!"
});

// Variables and add translation to existing
l10n.addTranslations('en', {
    "MSG_N_ITEM_FOUND" : "{{num}} items found!",
    "DISPLAY_PAGE_NUMBER" : "Displaying {{current}} of {{total}} records"
});
```

## End User APIs
Localization is only needed when you want to localize content based on User's locale.

If you are using core NodeJS, Enable l10n to any damm object!! by just a line...

```js
// Enable l10n
var any = {};
l10n.enableL10N(any, 'en')

// Usage
console.log(any.t('MSG_N_ITEM_FOUND', {num: 10})); // 10 items found!
console.log(any.t("DISPLAY_PAGE_NUMBER", {"current": 10, total: 25})); // Displaying 10 of 25 records
```

If you are using Express framework, which is worldwide accepted! use below middleware,

```js
// Express Middleware works beautifully here...
var express = require('express');
var app = express();

// Using custom header X-L10N-Locale
app.use(l10n.enableL10NExpress);
app.post('/anyReq', function(req, res) {
  console.log(req.t('MSG_N_ITEM_FOUND', {num: 10})) // 10 items found!
});
```

Example:

```js
// cURL - en
// curl -X POST -H "X-L10N-Locale: en" -H "Content-Type: application/json" -d '{"abc":"123"}'  http://localhost:1338/anyReq

app.post('/anyReq', function(req, res) {
  console.log(req.t('HEL')) // Hello!
});

// cURL - fr
// curl -X POST -H "X-L10N-Locale: fr" -H "Content-Type: application/json" -d '{"abc":"123"}'  http://localhost:1338/anyReq

app.post('/anyReq', function(req, res) {
  console.log(req.t('HEL')) // salut!
});
```

## CLI Usage
If you are using from CLI, no user locale will be there right, so you may use it's global version, 

```js
// This will set locale globally on server
l10n.setLocale('en');
console.log(l10n.t("HEL")); // Hello!

l10n.setLocale('fr');
console.log(l10n.t("HEL")); // salut!
```

## License
The MIT License (MIT)
