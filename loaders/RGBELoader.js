// RGBELoader.js (Patched for browser use with global THREE)

(function () {
  const {
    DataTextureLoader,
    DataTexture,
    DataUtils,
    FloatType,
    HalfFloatType,
    LinearFilter,
    LinearSRGBColorSpace,
    RGBAFormat
  } = window.THREE;

  class RGBELoader extends DataTextureLoader {

    constructor(manager) {
      super(manager);
      this.type = HalfFloatType;
    }

    setDataType(value) {
      this.type = value;
      return this;
    }

    load(url, onLoad, onProgress, onError) {
      const loader = new window.THREE.FileLoader(this.manager);
      loader.setResponseType('arraybuffer');
      loader.setPath(this.path);
      loader.setWithCredentials(this.withCredentials);
      loader.load(url, (buffer) => {
        try {
          const texData = this.parse(buffer);
          const texture = new DataTexture(
            texData.data,
            texData.width,
            texData.height,
            RGBAFormat,
            this.type
          );

          texture.image = {
            data: texData.data,
            width: texData.width,
            height: texData.height
          };

          texture.colorSpace = LinearSRGBColorSpace;
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          texture.needsUpdate = true;

          onLoad(texture);
        } catch (e) {
          if (onError) onError(e);
        }
      }, onProgress, onError);
    }

    // --- Full parse logic ---
    parse(buffer) {
      const rgbe_error = (code, msg) => {
        const errors = {
          1: 'Read Error',
          2: 'Write Error',
          3: 'Bad File Format',
          4: 'Memory Error'
        };
        throw new Error(`THREE.RGBELoader: ${errors[code]}: ${msg || ''}`);
      };

      const fgets = (buffer, lineLimit = 1024, consume = true) => {
        const NEWLINE = '\n';
        const chunkSize = 128;
        let p = buffer.pos, i = -1, len = 0, s = '';
        let chunk = String.fromCharCode.apply(null, new Uint16Array(buffer.subarray(p, p + chunkSize)));

        while ((i = chunk.indexOf(NEWLINE)) < 0 && len < lineLimit && p < buffer.byteLength) {
          s += chunk;
          len += chunk.length;
          p += chunkSize;
          chunk += String.fromCharCode.apply(null, new Uint16Array(buffer.subarray(p, p + chunkSize)));
        }

        if (i >= 0) {
          if (consume !== false) buffer.pos += len + i + 1;
          return s + chunk.slice(0, i);
        }

        return false;
      };

      const RGBE_ReadHeader = (buffer) => {
        const header = {
          valid: 0,
          string: '',
          comments: '',
          programtype: 'RGBE',
          format: '',
          gamma: 1.0,
          exposure: 1.0,
          width: 0,
          height: 0
        };

        let line, match;
        const magic_re = /^#\?(\S+)/,
          gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)/,
          exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)/,
          format_re = /^\s*FORMAT=(\S+)/,
          dimensions_re = /^\s*-Y\s+(\d+)\s+\+X\s+(\d+)/;

        if (buffer.pos >= buffer.byteLength || !(line = fgets(buffer))) {
          rgbe_error(1, 'no header found');
        }

        if (!(match = line.match(magic_re))) {
          rgbe_error(3, 'bad initial token');
        }

        header.valid |= 1;
        header.programtype = match[1];
        header.string += line + '\n';

        while (true) {
          line = fgets(buffer);
          if (line === false) break;
          header.string += line + '\n';

          if (line.charAt(0) === '#') {
            header.comments += line + '\n';
            continue;
          }

          if ((match = line.match(gamma_re))) header.gamma = parseFloat(match[1]);
          if ((match = line.match(exposure_re))) header.exposure = parseFloat(match[1]);
          if ((match = line.match(format_re))) {
            header.valid |= 2;
            header.format = match[1];
          }
          if ((match = line.match(dimensions_re))) {
            header.valid |= 4;
            header.height = parseInt(match[1], 10);
            header.width = parseInt(match[2], 10);
          }

          if ((header.valid & 2) && (header.valid & 4)) break;
        }

        if (!(header.valid & 2)) rgbe_error(3, 'missing format specifier');
        if (!(header.valid & 4)) rgbe_error(3, 'missing image size specifier');

        return header;
      };

      const RGBE_ReadPixels_RLE = (buffer, w, h) => {
        const scanline_width = w;
        if ((scanline_width < 8) || (scanline_width > 0x7fff)) {
          return new Uint8Array(buffer);
        }

        if ((buffer[0] !== 2) || (buffer[1] !== 2) || (buffer[2] & 0x80)) {
          return new Uint8Array(buffer);
        }

        const data_rgba = new Uint8Array(4 * w * h);
        let offset = 0, pos = 0;
        const ptr_end = 4 * scanline_width;
        const rgbeStart = new Uint8Array(4);
        const scanline_buffer = new Uint8Array(ptr_end);
        let num_scanlines = h;

        while (num_scanlines-- > 0) {
          rgbeStart.set(buffer.subarray(pos, pos + 4));
          pos += 4;

          if ((rgbeStart[0] !== 2) || (rgbeStart[1] !== 2) || (((rgbeStart[2] << 8) | rgbeStart[3]) !== scanline_width)) {
            rgbe_error(3, 'bad scanline format');
          }

          let ptr = 0, count;
          while (ptr < ptr_end && pos < buffer.byteLength) {
            count = buffer[pos++];
            const isEncoded = count > 128;
            if (isEncoded) count -= 128;
            if (count === 0 || (ptr + count) > ptr_end) rgbe_error(3, 'bad scanline data');

            if (isEncoded) {
              const value = buffer[pos++];
              scanline_buffer.fill(value, ptr, ptr + count);
              ptr += count;
            } else {
              scanline_buffer.set(buffer.subarray(pos, pos + count), ptr);
              pos += count;
              ptr += count;
            }
          }

          for (let i = 0; i < scanline_width; i++) {
            let off = 0;
            data_rgba[offset] = scanline_buffer[i + off];
            off += scanline_width;
            data_rgba[offset + 1] = scanline_buffer[i + off];
            off += scanline_width;
            data_rgba[offset + 2] = scanline_buffer[i + off];
            off += scanline_width;
            data_rgba[offset + 3] = scanline_buffer[i + off];
            offset += 4;
          }
        }

        return data_rgba;
      };

      const RGBEByteToRGBHalf = (src, sOff, dst, dOff) => {
        const e = src[sOff + 3];
        const scale = Math.pow(2.0, e - 128.0) / 255.0;
        dst[dOff] = DataUtils.toHalfFloat(Math.min(src[sOff] * scale, 65504));
        dst[dOff + 1] = DataUtils.toHalfFloat(Math.min(src[sOff + 1] * scale, 65504));
        dst[dOff + 2] = DataUtils.toHalfFloat(Math.min(src[sOff + 2] * scale, 65504));
        dst[dOff + 3] = DataUtils.toHalfFloat(1);
      };

      const byteArray = new Uint8Array(buffer);
      byteArray.pos = 0;
      const header = RGBE_ReadHeader(byteArray);

      const w = header.width,
        h = header.height,
        image_rgba_data = RGBE_ReadPixels_RLE(byteArray.subarray(byteArray.pos), w, h);

      const numPixels = image_rgba_data.length / 4;
      const halfArray = new Uint16Array(numPixels * 4);

      for (let j = 0; j < numPixels; j++) {
        RGBEByteToRGBHalf(image_rgba_data, j * 4, halfArray, j * 4);
      }

      return {
        width: w,
        height: h,
        data: halfArray,
        header: header.string,
        gamma: header.gamma,
        exposure: header.exposure,
        type: this.type
      };
    }
  }

  window.RGBELoader = RGBELoader;
})();
