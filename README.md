# node-SHT20

[![NPM](https://nodei.co/npm/node-sht20.png)](https://npmjs.org/package/node-sht20)

## Install

```sh
npm install node-sht20
```

```sh
pnpm add node-sht20
```

```sh
yarn add node-sht20
```

## Usage

Usage in TypeScript (with ES Modules):

```typescript
import SHT20 from 'node-sht20';

const sensor = new SHT20({
	bus: 1
});

async function start() {
	const { temperature, humidity } = await sensor.read();

	console.log(`Temperature: ${temperature.value} ${temperature.unit}`);
	console.log(`Humidity: ${humidity.value} ${humidity.unit}`);

	// Temperature in another unit

	const degreeFahrenheit = temperature.toFahrenheit();
	console.log(`Temperature: ${degreeFahrenheit.value} ${degreeFahrenheit.unit}`);
}

start();
```

Usage in JavaScript (with CommonJS):

```js
const nodeSHT20 = require('node-sht20');

const sensor = new nodeSHT20.SHT20({
	bus: 1
});

async function start() {
	const { temperature, humidity } = await sensor.read();

	console.log(`Temperature: ${temperature.value} ${temperature.unit}`);
	console.log(`Humidity: ${humidity.value} ${humidity.unit}`);

	// Temperature in another unit

	const degreeFahrenheit = temperature.toFahrenheit();
	console.log(`Temperature: ${degreeFahrenheit.value} ${degreeFahrenheit.unit}`);
}

start();
```

---

## Author

👤 **KillerJulian <info@killerjulian.de>**

- Github: [@KillerJulian](https://github.com/KillerJulian)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/KillerJulian/node-sht20/issues). You can also take a look at the [contributing guide](https://github.com/KillerJulian/node-sht20/blob/master/CONTRIBUTING.md).
