# node-sht20

[![NPM](https://nodei.co/npm/node-sht20.png)](https://npmjs.org/package/node-sht20)

## Install

```text
npm install node-sht20
```

```text
pnpm install node-sht20
```

```text
yarn add node-sht20
```

## Usage

Usage in TypeScript (with ES Modules):

```typescript
import SHT20 from 'node-sht20';

const sensor = new SHT20({ bus: 1 });

async function start() {
  await sensor.open();

  const { temperature, humidity } = await sensor.read();

  console.log(`Temperature: ${temperature.value} ${temperature.unit}`);
  console.log(`Humidity: ${humidity.value} ${humidity.unit}`);

  // Temperature in another unit

  const degreeFahrenheit = temperature.toFahrenheit();
  console.log(`Temperature: ${degreeFahrenheit.value} ${degreeFahrenheit.unit}`);

  await sensor.close();
}

start();
```

---

## Author

👤 **Julian Wowra <development@julianwowra.de>**

- Github: [@JulianWowra](https://github.com/JulianWowra)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/JulianWowra/node-sht20/issues). You can also take a look at the [contributing guide](https://github.com/JulianWowra/node-sht20/blob/main/CONTRIBUTING.md).
