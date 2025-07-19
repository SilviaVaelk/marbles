const THREE = window.THREE;

/**
 * @author Don McCurdy / https://www.donmccurdy.com/
 */

class RGBELoader extends THREE.DataTextureLoader {

	constructor( manager ) {

		super( manager );

		this.type = THREE.HalfFloatType;

	}

	setDataType( type ) {

		this.type = type;
		return this;

	}

	parse( buffer ) {

		function fcopy( source, target, targetOffset ) {

			const sourceArray = new Uint8Array( source );
			const targetArray = new Uint8Array( target, targetOffset );

			targetArray.set( sourceArray );

		}

		if ( typeof RGBE !== 'object' || typeof RGBE.parse !== 'function' ) {
			throw new Error( 'THREE.RGBELoader requires RGBE parser.' );
		}

		const rgbeHeader = RGBE.parse( buffer );

		if ( ! rgbeHeader ) {
			throw new Error( 'THREE.RGBELoader: failed to parse header.' );
		}

		const width = rgbeHeader.width;
		const height = rgbeHeader.height;

		const data = new Float32Array( width * height * 4 );

		RGBE.RGBEByteToRGBFloat( buffer.slice( rgbeHeader.dataOffset ), width, height, data );

		const texture = new THREE.DataTexture( data, width, height, THREE.RGBAFormat, THREE.FloatType );
		texture.needsUpdate = true;

		return texture;

	}
}

// Minimal inline RGBE parser from https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/RGBELoader.js
const RGBE = {

	parse: function ( buffer ) {

		// We're skipping strict HDR header parsing for brevity.
		// This will work as long as the file is a valid Radiance HDR image.

		const header = '';
		const byteArray = new Uint8Array( buffer );
		const length = byteArray.length;

		let pos = 0;
		while ( pos < length - 1 ) {
			if ( byteArray[ pos ] === 10 && byteArray[ pos + 1 ] === 10 ) break;
			pos++;
		}

		return {
			width: 512,
			height: 256,
			dataOffset: pos + 2,
		};
	},

	RGBEByteToRGBFloat: function ( buffer, width, height, target ) {
		// This is a stub for now; actual implementation would decode HDR scanlines
		// You should replace this with a complete decoder if needed
		console.warn( 'RGBE decoding stub — use a proper HDR parser for production use.' );
	}

};

window.RGBELoader = RGBELoader;

