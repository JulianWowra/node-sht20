import { openSync } from 'i2c-bus';

export enum TemperatureUnits {
	DEGREE_CELSIUS = '°C',
	DEGREES_FAHRENHEIT = '°F',
	KELVIN = 'K'
}

export class Temperature {
	readonly value: number;
	readonly unit: TemperatureUnits;

	constructor(value: number, unit = TemperatureUnits.DEGREE_CELSIUS) {
		this.value = value;
		this.unit = unit;
	}

	rounded(decimalPlaces = 1) {
		return round(this.value, decimalPlaces);
	}

	toCelsius() {
		switch (this.unit) {
			case TemperatureUnits.DEGREES_FAHRENHEIT: {
				return new Temperature(((this.value - 32) * 5) / 9, TemperatureUnits.DEGREE_CELSIUS);
			}
			case TemperatureUnits.KELVIN: {
				return new Temperature(this.value - 273.15, TemperatureUnits.DEGREE_CELSIUS);
			}
			default:
				return this;
		}
	}

	toFahrenheit() {
		switch (this.unit) {
			case TemperatureUnits.DEGREE_CELSIUS: {
				return new Temperature((this.value * 9) / 5 + 32, TemperatureUnits.DEGREES_FAHRENHEIT);
			}
			case TemperatureUnits.KELVIN: {
				return new Temperature(((this.value - 273, 15) * 9) / 5 + 32, TemperatureUnits.DEGREES_FAHRENHEIT);
			}
			default:
				return this;
		}
	}

	toKelvin() {
		switch (this.unit) {
			case TemperatureUnits.DEGREE_CELSIUS: {
				return new Temperature(this.value + 273.15, TemperatureUnits.KELVIN);
			}
			case TemperatureUnits.DEGREES_FAHRENHEIT: {
				return new Temperature(((this.value - 32) * 5) / 9 + 273.15, TemperatureUnits.KELVIN);
			}
			default:
				return this;
		}
	}
}

export enum HumidityUnits {
	PERCENT = '%'
}

export class Humidity {
	readonly value: number;
	readonly unit: HumidityUnits;

	constructor(value: number, unit = HumidityUnits.PERCENT) {
		this.value = value;
		this.unit = unit;
	}

	rounded(decimalPlaces = 1) {
		return round(this.value, decimalPlaces);
	}
}

export function scanBus(bus: number) {
	const wire = openSync(bus);
	const result = wire.scanSync();

	wire.closeSync();
	return result;
}

/**
 */
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function round(value: number, decimalPlaces: number): number {
	if (!isFinite(value) || decimalPlaces < 0) {
		throw new Error('Invalid input for rounding!');
	}

	const factor = Math.pow(10, decimalPlaces);
	return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 */
export function extractRawValue(buffer: Buffer): number {
	// Ensure the buffer has the correct length
	if (buffer.length !== 3) {
		throw new Error('The read data are invalid! Expected 3 bytes.');
	}

	// Validate the CRC checksum
	if (!validateCRC(buffer)) {
		throw new Error('CRC check failed: The read data are invalid!');
	}

	// Extract and return the raw value (mask out status bits)
	return ((buffer[0] << 8) | buffer[1]) & 0xfffc;
}

/**
 */
function validateCRC(buffer: Buffer): boolean {
	let crc = 0;

	// Calculate the CRC over the first 2 bytes
	for (const byte of buffer.subarray(0, 2)) {
		crc ^= byte;

		for (let i = 0; i < 8; i++) {
			crc = crc & 0x80 ? (crc << 1) ^ 0x31 : crc << 1;
		}
	}

	// Compare the calculated CRC with the provided one
	return (crc & 0xff) === buffer[2];
}
