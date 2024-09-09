// @ts-check

import fs from 'fs';

import { 音韻地位 } from 'tshet-uinh';

const hanPattern =
  /[\u3006\u3007\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\u{2ceb0}-\u{2ebef}\u{30000}-\u{3134f}]/u;

const data = fs.readFileSync('index.txt').toString();

const it = data[Symbol.iterator]();

for (;;) {
  let res = it.next();
  if (res.done) {
    break;
  }
  const 字 = res.value;
  if (!hanPattern.test(字)) {
    continue;
  }
  res = it.next();
  if (res.done || res.value !== '(') {
    throw new Error(`expect '(' after ${字}`);
  }
  const chs = [];
  for (;;) {
    const { value, done } = it.next();
    if (done) {
      throw new Error(`expect ')' after ${字}`);
    }
    if (value === ')') {
      break;
    }
    chs.push(value);
  }
  const 描述 = chs.join('');
  const 地位 = 音韻地位.from描述(描述);
  if (地位.描述 !== 描述) {
    throw new Error(
      `non-identical 地位 created from 描述: ${描述} -> ${地位.描述}`,
    );
  }
}

console.log('Test passed!');
