import CJ from 'crypto-js/core';
import Aes from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import Pkcs7 from 'crypto-js/pad-pkcs7';

let instance = null;
const FILE_PROFIX = 'Mzc1OTM2NTk=';
const FILE_PROOFIX = 'Y2VjMjc4YjZiNTBhMTFlNw==';
const FILE_PPROFIX = 'NGRzMTIya2Izc2Q=';
const _keyStr =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export default class PhotoHelper {
  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }

  cropPhoto(height, path) {
    const photoHeight =
      height.substring(0, 10) + height.substring(height.length - 3);
    const h = this.decode(FILE_PROFIX).substring(2, 5) + photoHeight;
    const result = this.getPhotoEXif(h, path);
    if (!result) {
      return result;
    }

    return `{"data":"${result}"}`;
  }

  rotatePhoto(height, path) {
    const h = height.substring(0, 16);
    return this.getPhotoEXif(h, path);
  }

  zoomPhoto(height, path) {
    const h =
      this.decode(FILE_PPROFIX).substring(5, 8) + height.substring(0, 13);
    return this.getPhotoEXif(h, path);
  }

  getPhotoEXif(h, path) {
    const parsedStr = Utf8.parse(h);

    try {
      const w = Utf8.parse(this.decode(FILE_PROOFIX));
      return Aes.encrypt(path, parsedStr, {
        iv: w,
        mode: CJ.mode.CBC,
        padding: Pkcs7,
      });
    } catch (e) {
      return false;
    }
  }

  decode(string) {
    let output = '';
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;
    const input = string.replace(/[^A-Za-z0-9+/=]/g, '');

    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output += String.fromCharCode(chr1);
      if (enc3 !== 64) {
        output += String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output += String.fromCharCode(chr3);
      }
    }
    output = this.utfDecode(output);
    return output;
  }

  utfDecode(utftext) {
    let string = '';
    let i = 0;
    let c = 0;
    let c2 = 0;
    let c3 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63),
        );
        i += 3;
      }
    }
    return string;
  }
}
