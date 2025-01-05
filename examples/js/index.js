const { SHT20 } = require('../../dist/index');

const sensor = new SHT20({ bus: 1 });

async function start() {
	const { temperature, humidity } = await sensor.read();

	console.log(`Temperature: ${temperature.value} ${temperature.unit}`);
	console.log(`Humidity: ${humidity.value} ${humidity.unit}`);

	// Temperature in another unit

	const degreeFahrenheit = temperature.toFahrenheit();
	console.log(`Temperature: ${degreeFahrenheit.value} ${degreeFahrenheit.unit}`);

	await sensor.close();
}

start();
