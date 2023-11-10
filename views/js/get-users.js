const userListBtn = document.querySelector('#list-home-list');
const userContainer = document.querySelector('#list-users');
const userContainerWrapper = document.querySelector('#list-users__wrapper');
const paginationFirstChild = document.querySelector('.pagination > li');
const paginationButtons = userContainer.querySelectorAll('.pagination li');

addPaginationListeners();

userListBtn.addEventListener('click', async(e) => {
	const data = {
		url: new URL(window.location.protocol + '//' + window.location.host + '/users'),
		method: 'GET',
		params: {
			skip: 0,
			limit: 50
		}
	};

	for (const paginationButton of paginationButtons) {
		paginationButton.classList.remove('active');
	}

	paginationFirstChild.classList.add('active');

	Object.keys(data.params).forEach((key) => { return data.url.searchParams.append(key, data.params[key]); });
	const response = await request(data);

	userContainerWrapper.innerHTML = response;
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
	paginationButtons.forEach((item) => {
		item.addEventListener('click', async (e) => {
			e.preventDefault();

			for (const paginationButton of paginationButtons) {
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

			userContainerWrapper.innerHTML = response;
		});
	});
}
