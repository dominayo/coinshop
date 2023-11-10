const dealsListBtn = document.querySelector('#list-deals-list');
const dealsContainer = document.querySelector('#list-deals');
const dealsContainerWrapper = document.querySelector('#list-deals__wrapper');
const dealsPaginationFirstChild = dealsContainer.querySelector('.pagination > li');
const dealsPaginationButtons = dealsContainer.querySelectorAll('.pagination li');

addPaginationListeners();

dealsListBtn.addEventListener('click', async(e) => {
	const data = {
		url: new URL(window.location.protocol + '//' + window.location.host + '/deals'),
		method: 'GET',
		params: {
			skip: 0,
			limit: 50
		}
	};

	for (const paginationButton of dealsPaginationButtons) {
		paginationButton.classList.remove('active');
	}

	dealsPaginationFirstChild.classList.add('active');

	Object.keys(data.params).forEach((key) => { return data.url.searchParams.append(key, data.params[key]); });
	const response = await request(data);

	dealsContainerWrapper.innerHTML = response;
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
	dealsPaginationButtons.forEach((item) => {
		item.addEventListener('click', async (e) => {
			e.preventDefault();

			for (const paginationButton of dealsPaginationButtons) {
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

			dealsContainerWrapper.innerHTML = response;
		});
	});
}
