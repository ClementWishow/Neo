import { readFile } from "fs/promises";
import CryptoJS from "crypto-js";


const data = JSON.parse(
  await readFile(new URL("../data.json", import.meta.url))
);

const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = 'Put_Your_Password_Here'; // or generate sample key Buffer.from('FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=', 'base64');
const IV_LENGTH = 16;

export function encrypt(text) {
    return CryptoJS.AES.encrypt(text, 'secret key 123').toString();
}

export function decrypt(text) {
  var bytes  = CryptoJS.AES.decrypt(text, 'secret key 123');
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}
