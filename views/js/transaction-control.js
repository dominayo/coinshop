const confirmBtns = document.querySelectorAll('#confrim-widthraw');
const abortBtns = document.querySelectorAll('#abort-widthraw');

setTransactionControlListeners(confirmBtns);
setTransactionControlAbortListeners(abortBtns);

async function setTransactionControlListeners(btns) {
	for (const btn of btns) {
		btn.addEventListener('click', async (e) => {
			e.preventDefault();
			const transactionId = e.target.dataset.transactionid;

			await transactionVerdictRequest({ transactionId, verdict: true });

			e.target.parentElement.parentElement.remove();
		});
	}
}

async function setTransactionControlAbortListeners(btns) {
	for (const btn of btns) {
		btn.addEventListener('click', async (e) => {
			e.preventDefault();
			const transactionId = e.target.dataset.transactionid;

			await transactionVerdictRequest({ transactionId, verdict: false });

			e.target.parentElement.parentElement.remove();
		});
	}
}

async function transactionVerdictRequest({ transactionId, verdict }) {
	return fetch('/transaction/verdict', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ transactionId, verdict })
	})
		.then((res) => {
			res.json();
		})
		.then((data) => {
			console.log(data);

			return data;
		});
}
