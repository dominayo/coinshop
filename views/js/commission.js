const commissionSaveBtns = document.querySelectorAll('#commission-save');

for (const commissionSaveBtn of commissionSaveBtns) {
	commissionSaveBtn.addEventListener('click', async(e) => {
		let data = {};

		data.cryptoCurrency = e.target.parentElement.querySelector('.commission-input').dataset.cryptocurrency;
		data.commission = e.target.parentElement.querySelector('.commission-input').value / 100;

		await commissionRequest(data);
	});
}

async function commissionRequest(data) {
	return fetch('/commissions/commission', {
		method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *client
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
}
