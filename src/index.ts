import { type I2CBus, open as openI2CConnection } from 'i2c-bus';
import { I2CADDR, READHUMI_NOHHOLD, READTEMP_NOHOLD } from './constants';
import { extractRawValue, Humidity, round, sleep, Temperature } from './utilities';

/**
 * Represents the SHT20 sensor
 */
export class SHT20 {
	private readonly address: number;
	private readonly bus: number;

	private wire: I2CBus | null = null;

	/**
	 * Create a new SHT20 sensor
	 * @param options Options for the sensor
	 */
	constructor(options: SHT20Options = {}) {
		this.address = options.address ?? I2CADDR;
		this.bus = options.bus ?? 1;
	}

	/**
	 * Read data from the I2C bus for the specified device address
	 * @param length The number of bytes to read
	 * @returns A promise that resolves with a buffer containing the data
	 */
	private i2cRead(length: number) {
		return new Promise<Buffer>((resolve, reject) => {
			if (!this.wire) {
				return reject(new Error('Wire is not open'));
			}

			this.wire.i2cRead(this.address, length, Buffer.alloc(length), (error: Error, bytesRead, buffer) => {
				if (error) {
					return reject(error);
				}

				if (bytesRead !== length) {
					return reject(new Error(`Expected to read ${length} bytes, but only read ${bytesRead} bytes`));
				}

				resolve(buffer);
			});
		});
	}

	/**
	 * Write data to the I2C bus for the specified device address
	 * @param cmd The command to write
	 * @returns A promise that resolves when the write is complete
	 */
	private i2cWrite(cmd: number): Promise<void> {
		const bCMD = Buffer.from([cmd]);

		return new Promise<void>((resolve, reject) => {
			if (!this.wire) {
				return reject(new Error('Wire is not open'));
			}

			this.wire.i2cWrite(this.address, bCMD.length, bCMD, (error: Error) => {
				if (error) {
					return reject(error);
				}

				resolve();
			});
		});
	}

	/**
	 * Opens the I2C bus connection
	 * @returns Resolves when the connection is successfully opened
	 */
	async open(openOptions?: Parameters<typeof openI2CConnection>[1]) {
		this.wire = await new Promise<I2CBus>((resolve, reject) => {
			if (this.wire) {
				return reject(new Error('Connection already open.'));
			}

			resolve(
				openI2CConnection(this.bus, openOptions || { forceAccess: false }, (error: Error) => {
					if (error) {
						reject(error);
					}
				})
			);
		});
	}

	/**
	 * Closes the I2C bus connection
	 * @returns Resolves when the connection is successfully closed
	 */
	async close() {
		this.wire = await new Promise<null>((resolve, reject) => {
			if (!this.wire) {
				return reject(new Error('Connection already closed.'));
			}

			this.wire.close((error: Error) => {
				if (error) {
					reject(error);
				}
			});

			resolve(null);
		});
	}

	/**
	 * Read the temperature from the sensor
	 * @returns A promise that resolves with a temperature class
	 */
	async readTemperature() {
		await this.i2cWrite(READTEMP_NOHOLD);
		await sleep(85);

		const data = await this.i2cRead(3);
		const rawtemp = extractRawValue(data);
		const temperature = (rawtemp / 65536.0) * 175.72 - 46.85;

		return new Temperature(round(temperature, 2));
	}

	/**
	 * Read the humidity from the sensor
	 * @returns A promise that resolves with a humidity class
	 */
	async readHumidity() {
		await this.i2cWrite(READHUMI_NOHHOLD);
		await sleep(29);

		const data = await this.i2cRead(3);
		const rawhumi = extractRawValue(data);
		const humidity = (rawhumi / 65536.0) * 125.0 - 6.0;

		return new Humidity(round(humidity, 1));
	}

	/**
	 * Read both the temperature and humidity from the sensor
	 * @returns A promise that resolves with an object containing the temperature and humidity
	 */
	async read() {
		return {
			temperature: await this.readTemperature(),
			humidity: await this.readHumidity()
		};
	}
}

/**
 * Options for the SHT20 sensor
 */
export type SHT20Options = {
	address?: number;
	bus?: number;
};

// Provide legacy support
export default SHT20;

export { Humidity, HumidityUnits, scanBus, Temperature, TemperatureUnits } from './utilities';
