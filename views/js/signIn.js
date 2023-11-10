const signInButton = document.querySelector('#signin');

signInButton.addEventListener('click', async(e) => {
	e.preventDefault();
	const emailInput = document.querySelector('#email');

	const passwordInput = document.querySelector('#password');
	const data = { email: emailInput.value, password: passwordInput.value };

	return fetch('/sign', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow',
		body: JSON.stringify(data)
	})
		.then((res) => {
			console.log(res);
			return res.url;
		})
		.then((data) => {
			console.log(data);
			window.location.href = data;
		});
});
