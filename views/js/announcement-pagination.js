const advertListBtn = document.querySelector('#list-advert-list');
const advertContainer = document.querySelector('#list-advert');
const advertContainerWrapper = document.querySelector('#list-advert__wrapper');
const advertPaginationFirstChild = advertContainer.querySelector('.pagination > li');
const advertPaginationButtons = advertContainer.querySelectorAll('.pagination li');

addPaginationListeners();

advertListBtn.addEventListener('click', async(e) => {
	const data = {
		url: new URL(window.location.protocol + '//' + window.location.host + '/adverts'),
		method: 'GET',
		params: {
			skip: 0,
			limit: 50
		}
	};

	for (const paginationButton of advertPaginationButtons) {
		paginationButton.classList.remove('active');
	}

	advertPaginationFirstChild.classList.add('active');

	Object.keys(data.params).forEach((key) => { return data.url.searchParams.append(key, data.params[key]); });
	const response = await request(data);

	advertContainerWrapper.innerHTML = response;
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
	advertPaginationButtons.forEach((item) => {
		item.addEventListener('click', async (e) => {
			e.preventDefault();

			for (const paginationButton of advertPaginationButtons) {
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

			advertContainerWrapper.innerHTML = response;
		});
	});
}
