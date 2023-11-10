// const token = localStorage.setItem('Bearer', 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGVjMTc3ZjQ3ZDhmMjA0OGNkZTc0MGQiLCJpYXQiOjE2MjYwODUzMjMsImV4cCI6MTYyNjA4ODkyM30.W37xLICw1V_0Y0VVyu-10_fbCyXvBbQRtNZBCpFj72ojI8YYTdhf_cFiiUKi9oHUQMfbg0qtJrt1QHM4MLGLiA');
// const originUrl = 'localhost:3002';
const originUrl = window.location.protocol + '//ws.' + window.location.host.substring(4, window.location.host.length);

// socket.emit('dispute-chat', { chatId: '6101666eda0715ae3b7ba17c', message: 'Снимок экрана 2021-05-20 в 17.49.43 1.png', messageType: 'FILE', contentType: 'image/png' });

function getCookies(name) {
	const cookie = {};

	document.cookie.split(';').forEach((el) =>{
		const [k,v] = el.split('=');

		cookie[k.trim()] = v;
	});
	return cookie[name];
}

const socket = io(originUrl, {
	// autoConnect: false,
	auth: {
		token: getCookies('authorization').split('%20')[1]
	}
});

// socket.once('connect', (client) => {
// 	socket.on('chat-dispute', (message) => {
// 		console.log(message);
// 	});
// });

// socket.once('connect', (client) => {
// 	socket.on('notification', (message) => {
// 		console.log(message);
// 	});
// });

// socket.once('connect', (client) => {
// 	socket.onAny((message) => {
// 		console.log(message);
// 	});
// });

// socket.emit('chat', { chatId: '606352f4bef36dc45aea6db0', message: 'Hello, money not recieved' });
