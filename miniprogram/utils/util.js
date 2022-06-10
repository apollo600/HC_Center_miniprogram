import CryptoJS from 'crypto-js.js'

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const day = date.getDate()
    const hour = date.getHours()
    return [year,month,day].map(formatNumber).join('/') 
}

const formatNumber = n => {
    n = n.toString();
    return n[1] ? n : '0' + n
}

function encodeUTF8(s) {
    var i, r = [], c, x;
    for (i = 0; i < s.length; i++)
     if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
     else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
     else {
      if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
       c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
        r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
      else r.push(0xE0 + (c >> 12 & 0xF));
      r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
     };
    return r;
   };
   
   

     /**
   * AES-256-ECB对称加密
   * @param text {string} 要加密的明文
   * @param secretKey {string} 密钥，43位随机大小写与数字
   * @returns {string} 加密后的密文，Base64格式
   */
  function AES_ECB_ENCRYPT(text, secretKey) {
    var keyHex = CryptoJS.enc.Base64.parse(secretKey);
    var messageHex = CryptoJS.enc.Utf8.parse(text);
    var encrypted = CryptoJS.AES.encrypt(messageHex, keyHex, {
      "mode": CryptoJS.mode.ECB,
      "padding": CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  /**
   * AES-256-ECB对称解密
   * @param textBase64 {string} 要解密的密文，Base64格式
   * @param secretKey {string} 密钥，43位随机大小写与数字
   * @returns {string} 解密后的明文
   */
  function AES_ECB_DECRYPT(textBase64, secretKey) {
    var keyHex = CryptoJS.enc.Base64.parse(secretKey);
    var decrypt = CryptoJS.AES.decrypt(textBase64, keyHex, {
      "mode": CryptoJS.mode.ECB,
      "padding": CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt);
  }

module.exports = {
    formatTime: formatTime,
    AES_ECB_ENCRYPT:AES_ECB_ENCRYPT,
    AES_ECB_DECRYPT:AES_ECB_DECRYPT
}

