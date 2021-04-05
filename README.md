# @avindak/xgeopip

[![npm (scoped)](https://img.shields.io/npm/v/@avindak/xgeopip.svg)](https://www.npmjs.com/package/@avindak/xgeopip)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@avindak/xgeopip.svg)](https://www.npmjs.com/package/@avindak/xgeopip)

Provides a fast, seamless in memory ip to country functionality based on the ip2nation db.

- Minimal dependencies (adm-zip)
- Completely free
- Country resolution only
- Queries / sec > 2.3k per core
- Memory footprint < 40 MB
- Command line support


## Install

```
$ npm install @avindak/xgeopip
```

## Usage

```js
const geoip = require('../geoip/xgeoip');
await geoip.load_memory();
//AU
let res = await geoip.resolve("1.1.1.1");
console.log(res.country_code);
//IL
res = await geoip.resolve("84.108.14.154");
console.log(res.country_code);
//US
res = await geoip.resolve("34.44.12.234");
console.log(res.country_code);
//US
console.log(res);
//
//{
//  country_code: 'US',
//  country: 'United States',
//}

//Private
res = await geoip.resolve("192.168.1.1");
console.log(res.country_code);
//
console.log(res);
//{ country_code: '', country: 'Private', ip: '192.168.1.1' }

//Proxy example - prints US
res = await geoip.resolve("34.44.12.234 192.168.1.1");
console.log(res.country_code);


```