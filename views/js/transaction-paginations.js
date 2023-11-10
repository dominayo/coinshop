const transactionsListBtn = document.querySelector('#list-transactions-list');
const transactionsContainer = document.querySelector('#list-transactions');
const transactionsContainerWrapper = document.querySelector('#list-transactions__wrapper');
const transactionsPaginationFirstChild = transactionsContainer.querySelector('.pagination > li');
const transactionsPaginationButtons = transactionsContainer.querySelectorAll('.pagination li');

addPaginationListeners();

transactionsListBtn.addEventListener('click', async(e) => {
	const data = {
		url: new URL(window.location.protocol + '//' + window.location.host + '/transactions'),
		method: 'GET',
		params: {
			skip: 0,
			limit: 50
		}
	};

	for (const paginationButton of transactionsPaginationButtons) {
		paginationButton.classList.remove('active');
	}

	transactionsPaginationFirstChild.classList.add('active');

	Object.keys(data.params).forEach((key) => { return data.url.searchParams.append(key, data.params[key]); });
	const response = await request(data);

	transactionsContainerWrapper.innerHTML = response;
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
	transactionsPaginationButtons.forEach((item) => {
		item.addEventListener('click', async (e) => {
			e.preventDefault();

			for (const paginationButton of transactionsPaginationButtons) {
				paginationButton.classList.remove('active');
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

			transactionsContainerWrapper.innerHTML = response;

			addControlListeners();
		});
	});
}
