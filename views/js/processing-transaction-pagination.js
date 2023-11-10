const widthrawListBtn = document.querySelector('#list-widthraw-list');
const widthrawContainer = document.querySelector('#list-widthraw');
const widthrawContainerWrapper = document.querySelector('#list-widthraw__wrapper');
const widthrawPaginationFirstChild = widthrawContainer.querySelector('.pagination > li');
const widthrawPaginationButtons = widthrawContainer.querySelectorAll('.pagination li');

addPaginationListeners();

widthrawListBtn.addEventListener('click', async(e) => {
	const data = {
		url: new URL(window.location.protocol + '//' + window.location.host + '/widthraw-list'),
		method: 'GET',
		params: {
			skip: 0,
			limit: 50
		}
	};

	for (const widthrawPaginationButton of widthrawPaginationButtons) {
		widthrawPaginationButton.classList.remove('active');
	}

	widthrawPaginationFirstChild.classList.add('active');

	Object.keys(data.params).forEach((key) => { return data.url.searchParams.append(key, data.params[key]); });
	const response = await request(data);

	widthrawContainerWrapper.innerHTML = response;

	addControlListeners();

});

async function request({ url, method, data }) {
	return fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow'
	})
		.then((res) => {
			return res.text();
		})
		.then((data) => {

			return data;
		});
}

async function addPaginationListeners() {
	widthrawPaginationButtons.forEach((item) => {
		item.addEventListener('click', async (e) => {
			e.preventDefault();

			for (const widthrawPaginationButton of widthrawPaginationButtons) {
				widthrawPaginationButton.classList.remove('active');
			}

			e.target.parentElement.classList.add('active');
			const page = e.target.innerText;

			const data = {
				url: new URL(window.location.protocol + '//' + window.location.host + '/' + item.parentElement.dataset.url),
				method: 'Get',
				params: {
					skip: (page - 1) * 50,
					limit: 50
				}
			};

			Object.keys(data.params).forEach((key) => { return data.url.searchParams.append(key, data.params[key]); });
			const response = await request({ url: data.url, method: 'GET', data: data.params });

			widthrawContainerWrapper.innerHTML = response;

			await addControlListeners();
		});
	});
}

async function addControlListeners() {
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
}
