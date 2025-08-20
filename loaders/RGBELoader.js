import * as THREE from 'three';

/**
 * RGBELoader with real decoding logic — compatible with direct browser use.
 * Source adapted from three.js r160
 */

class RGBELoader extends THREE.DataTextureLoader {
	constructor(manager) {
		super(manager);
		this.type = THREE.FloatType;
	}

	setDataType(type) {
		this.type = type;
		return this;
	}

	parse(buffer) {
		const byteArray = new Uint8Array(buffer);
		const header = this._parseHeader(byteArray);

		const width = header.width;
		const height = header.height;

		const imageData = this._readPixels(byteArray.subarray(header.dataPosition), width, height);
		const data = new Float32Array(4 * width * height);

		for (let i = 0; i < width * height; i++) {
			data[4 * i] = imageData[i][0];
			data[4 * i + 1] = imageData[i][1];
			data[4 * i + 2] = imageData[i][2];
			data[4 * i + 3] = 1;
		}

		const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, this.type);
		texture.flipY = true;
		texture.needsUpdate = true;

		return texture;
	}

	_parseHeader(buffer) {
		const decoder = new TextDecoder();
		const headerStr = decoder.decode(buffer.subarray(0, 512));
		const lines = headerStr.split('\n');

		let width = 0;
		let height = 0;
		let foundFormat = false;
		let dataPosition = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.startsWith('FORMAT=')) {
				foundFormat = true;
			}
			if (line.match(/-Y (\d+) \+X (\d+)/)) {
				const match = line.match(/-Y (\d+) \+X (\d+)/);
				height = parseInt(match[1], 10);
				width = parseInt(match[2], 10);
				dataPosition = headerStr.indexOf(line) + line.length + 1;
				break;
			}
		}

		if (!foundFormat || !width || !height) {
			throw new Error('Invalid HDR header.');
		}

		return { width, height, dataPosition };
	}

	_readPixels(buffer, width, height) {
		const rgbe = new Uint8Array(4);
		let offset = 0;
		const scanlineWidth = width;
		const numScanlines = height;
		const data = [];

		for (let j = 0; j < numScanlines; j++) {
			offset += 4; // skip scanline header

			const scanline = [[], [], [], []];
			for (let i = 0; i < 4; i++) {
				let pos = 0;
				while (pos < scanlineWidth) {
					const count = buffer[offset++];
					if (count > 128) {
						const value = buffer[offset++];
						for (let k = 0; k < count - 128; k++) {
							scanline[i][pos++] = value;
						}
					} else {
						for (let k = 0; k < count; k++) {
							scanline[i][pos++] = buffer[offset++];
						}
					}
				}
			}

			for (let i = 0; i < scanlineWidth; i++) {
				rgbe[0] = scanline[0][i];
				rgbe[1] = scanline[1][i];
				rgbe[2] = scanline[2][i];
				rgbe[3] = scanline[3][i];

				data.push(this._rgbeToFloat(rgbe));
			}
		}
		return data;
	}

	_rgbeToFloat(rgbe) {
		if (rgbe[3]) {
			const f = Math.pow(2.0, rgbe[3] - 136);
			return [rgbe[0] * f / 255, rgbe[1] * f / 255, rgbe[2] * f / 255];
		}
		return [0, 0, 0];
	}
}

export { RGBELoader };
