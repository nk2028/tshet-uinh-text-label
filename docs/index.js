'use strict';

let prefetchedFunctions;

async function loadSchema(val) {
	const response = await fetch('https://cdn.jsdelivr.net/gh/nk2028/qieyun-examples@20201106/' + val + '.js');
	const text = await response.text();
	return new Function('音韻地位', '小韻號', '字頭', text);
}

const 音韻地位到小韻號 = {};

let yinping, yinshang, yinqu, yinru, yangping, yangshang, yangqu, yangru;  // For unt 切韻朗讀音

window.addEventListener('DOMContentLoaded', async (event) => {
	/* 預設為不轉換 */
	document.getElementById('selector').value = '';

	for (let i = 1; i <= 3874; i++) {
		音韻地位到小韻號[Qieyun.get音韻地位(i).音韻描述] = i;
	}

	const [kyonh, baxter, unt, dv9] = await Promise.all([loadSchema('kyonh'), loadSchema('baxter'), loadSchema('unt'), loadSchema('dv9')]);

	prefetchedFunctions = { 'kyonh': kyonh, 'unt': unt, 'dv9': dv9, 'baxter': baxter };

	/* For unt 切韻朗讀音 */
	yinping = new Audio('unt/yinping.wav');
	yinshang = new Audio('unt/yinshang.wav');
	yinqu = new Audio('unt/yinqu.wav');
	yinru = new Audio('unt/yinru.wav');
	yangping = new Audio('unt/yangping.wav');
	yangshang = new Audio('unt/yangshang.wav');
	yangqu = new Audio('unt/yangqu.wav');
	yangru = new Audio('unt/yangru.wav');
	initializeUnt();
	document.body.classList.add('no-unt');
});

function 音韻描述2音韻地位(音韻描述) {
	var pattern = /(.)(.)(.)([AB]?)(.)(.)/gu;  // 解析音韻地位
	var arr = pattern.exec(音韻描述);
	return new Qieyun.音韻地位(arr[1], arr[2], arr[3], arr[4] || null, arr[5], arr[6]);
}

async function handleChange(val) {
	var xs = document.getElementsByTagName('rt');

	if (val !== '') {
		var brogue2 = prefetchedFunctions[val];

		for (var i = 0; i < xs.length; i++) {
			var node = xs[i];

			if (!node.音韻描述)
				node.音韻描述 = node.firstChild.textContent;

			const 音韻地位 = 音韻描述2音韻地位(node.音韻描述), 小韻號 = 音韻地位到小韻號[node.音韻描述];

			let res;
			try {
				res = brogue2(音韻地位, 小韻號);
			} catch (e) { }

			node.innerText = res;
			node.lang = 'och-Latn-fonipa';
		}
	} else {
		for (var i = 0; i < xs.length; i++) {
			var node = xs[i];
			node.innerText = node.音韻描述;
			node.lang = 'lzh';
		}
	}

	if (val === 'unt') {
		document.body.classList.remove('no-unt');
	} else {
		document.body.classList.add('no-unt');
	}
}

/* For unt 切韻朗讀音 */

function play(audio) {
	return new Promise((resolve) => {
		audio.onended = resolve;
		audio.playbackRate = 2.0;
		audio.play();
	});
}

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

function initializeUnt() {
	const xs = document.querySelectorAll('body > p, body > h1, body > h2');
	for (const x of xs) {
		if (!x.querySelector('ruby'))
			continue;  // 如果某段落中一個 ruby 元素都没有，則不必朗讀

		const button = document.createElement('input');
		button.type = 'button';
		button.value = '🔊';
		button.classList.add('read-aloud');

		button.onclick = async () => {
			for (const y of x.childNodes) {
				if (y.tagName === 'RUBY') {
					const node = y.querySelector('rt');
					const 音韻地位 = 音韻描述2音韻地位(node.音韻描述);

					const is清 = 音韻地位.屬於('幫滂端透知徹精清心莊初生章昌書見溪影曉母')
						, is全濁 = 音韻地位.屬於('並定澄從邪崇俟常船羣匣母');
					await play(音韻地位.屬於('平聲') ? (is清 ? yinping : yangping)
						: 音韻地位.屬於('上聲') ? (!is全濁 ? yinshang : yangshang)
						: 音韻地位.屬於('去聲') ? (is清 ? yinqu : yangqu)
						: 音韻地位.屬於('入聲') ? (!is全濁 ? yinru : yangru)
						: null);  // 根據聲調播放對應的 Hum 聲
				} else if (y.nodeType === Node.TEXT_NODE) {
					await sleep(200);  // 若為標點符號，則插入一段靜音
				}
			}
		}
		x.appendChild(button);
	}
}
