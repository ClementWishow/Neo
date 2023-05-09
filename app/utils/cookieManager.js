import { readFile } from "fs/promises";
import CryptoJS from "crypto-js";
import exp from "constants";


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

function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}


export function createCookiePath() {
  const easy = getMultipleRandom(data.filter(x => x.tag === 'easy'), 3).map(x => x.name)
  const medium = getMultipleRandom(data.filter(x => x.tag === 'medium'), 3).map(x => x.name)
  const hard = getMultipleRandom(data.filter(x => x.tag === 'hard'), 3).map(x => x.name)
  return encrypt('begin' + '-' + easy.join('-') + '-' + medium.join('-') + '-' + hard.join('-') + '-', 'end')
}


export function updateCookiePath(path) {
  path.shift()
  return encrypt(path.join('-'))
}

export function getStepsFromCookie(cookie) {
  return decrypt(cookie).split('-')
}
