const cryptoWalletForms = document.querySelectorAll('.crypto-wallets');

for (const cryptoWalletForm of cryptoWalletForms) {
	const cryptoWalletInput = cryptoWalletForm.querySelector('input');
	const type = cryptoWalletForm.dataset.type;

	addUploadListener(cryptoWalletInput, type);
	const uploadCryptoWalletBtn = cryptoWalletForm.querySelector('button');

	sendButtonListener(uploadCryptoWalletBtn, type);

}

const data = {
	BTC: null,
	ETH: null
};

async function sendButtonListener(btn, type) {
	btn.addEventListener('click', async(e) => {
		e.preventDefault();

		await sendCryptoWalletData(type);
	});
}

async function addUploadListener(input, type) {
	input.addEventListener('change', async(e) => {
		const file = input.files[0];

		let formData = new FormData();

		formData.append('file', file);
		formData.append('type', type);

		if (type === 'BTC') {
			Object.assign(data, { BTC: formData });
		}

		if (type === 'ETH') {
			Object.assign(data, { ETH: formData });
		}
	});
}

async function sendCryptoWalletData(type) {
	return fetch(`/wallets/upload/${type.toLowerCase()}`, {
		method: 'POST',
		// headers: {
		// 	'Content-Length': file.length,
		// 	'Content-Type': 'multipart/form-data'
		// },
		body: data[type]
	});
}

