import { openSync } from 'i2c-bus';

/**
 * Represents the possible units of the temperature
 */
export enum TemperatureUnits {
	DEGREE_CELSIUS = '°C',
	DEGREES_FAHRENHEIT = '°F',
	KELVIN = 'K'
}

/**
 * Represents the temperature
 */
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

/**
 * Represents the posible units of the humidity
 */
export enum HumidityUnits {
	PERCENT = '%'
}

/**
 * Represents the humidity
 */
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

/**
 * Returns an array of numbers, where each number represents the I2C address of a detected device
 * @see https://github.com/fivdi/i2c-bus#busscansyncstartaddr-endaddr
 *
 * @param bus The number of the I2C bus
 * @returns An array of detected I2C addresses
 */
export function scanBus(bus: number) {
	const wire = openSync(bus);
	const result = wire.scanSync();

	wire.closeSync();
	return result;
}

/**
 * Pauses the execution for a specified amount of time
 * @param ms The time to sleep in milliseconds
 * @returns A promise that resolves after the specified amount of time
 */
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rounds a number to a specified number of decimal places
 * @param value The number to round
 * @param decimalPlaces The number of decimal places
 * @returns The rounded number
 */
export function round(value: number, decimalPlaces: number): number {
	if (!isFinite(value) || decimalPlaces < 0) {
		throw new Error('Invalid input for rounding!');
	}

	const factor = Math.pow(10, decimalPlaces);
	return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Validates the read data and extracts the raw value for the temperature or humidity
 * @param buffer The read data as a Buffer (expected length: 3 bytes)
 * @returns The raw value for the temperature or humidity
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
 * Validates the CRC checksum for the given data buffer
 * @param buffer The data buffer (2 data bytes + 1 CRC byte)
 * @returns True if the CRC is valid, otherwise false
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
