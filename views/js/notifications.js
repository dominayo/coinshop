const bell = document.querySelector('#bell-counter');
const inBoxChat = document.querySelector('.inbox_chat');
const messageHistory = document.querySelector('.msg_history');
const disputeVerdictBlock = document.querySelector('.dispute-verdict');

setInterval(async () => {
	const notificationResponse = await notificationRequest();
	// console.log(notificationResponse);
	const existingСhats = document.querySelectorAll('.chat_list');
	const existingСhatIds = [];

	for (const existingСhat of existingСhats) {
		existingСhatIds.push(existingСhat.getAttribute('id'));
	}

	for (const message of notificationResponse.message) {
		if (!existingСhatIds.includes(message.chatDisputeId)) {
			const chatList = await createChat(message);

			await setChatEventListener(chatList);
		}
	}

	// console.log(notificationResponse);
	const filterNotification = notificationResponse.message.filter((notification) => {
		return notification.isRead === false;
	});

	bell.innerHTML = filterNotification.length;
}, 5000);

async function createChat(chatData) {
	const chatList = document.createElement('div');

	chatList.classList.add('chat_list');
	chatList.setAttribute('id', chatData.chatDisputeId);
	chatList.dataset.dealId = chatData.dealId;

	const chatPeople = document.createElement('div');

	chatPeople.classList.add('chat_people');
	chatList.appendChild(chatPeople);

	const chatImgWrapper = document.createElement('div');

	chatImgWrapper.classList.add('chat_img');

	chatPeople.appendChild(chatImgWrapper);

	const chatImg = document.createElement('img');

	chatImg.src = 'https://ptetutorials.com/images/user-profile.png';

	chatImgWrapper.appendChild(chatImg);

	const chatIb = document.createElement('div');

	chatIb.classList.add('chat_ib');

	chatPeople.appendChild(chatIb);

	const chatPeopleName = document.createElement('h5');

	chatPeopleName.innerHTML = chatData.name;

	chatIb.appendChild(chatPeopleName);

	const chatDateSpan = document.createElement('span');

	chatDateSpan.classList.add('chat_date');
	chatDateSpan.innerHTML = new Date(chatData.createdAt).toUTCString();

	chatPeopleName.appendChild(chatDateSpan);

	const chatDisputeDescription = document.createElement('p');

	chatDisputeDescription.innerHTML = 'Dispute Chat';

	chatIb.appendChild(chatDisputeDescription);

	// inBoxChat.appendChild(chatList);

	inBoxChat.insertBefore(chatList, inBoxChat.firstChild);

	return chatList;
}

async function notificationRequest() {
	return fetch('/notifications', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			return data;
		});
}

async function setChatEventListener(element) {

	element.addEventListener('click', async() => {
		const existingСhats = document.querySelectorAll('.chat_list');

		disputeVerdictBlock.classList.remove('display-none');

		for (const existingСhat of existingСhats) {
			existingСhat.classList.remove('active_chat');
		}

		element.classList.add('active_chat');
		const dealId = element.dataset.dealId;

		const chatDisputeId = element.getAttribute('id');

		const messageData = await chatDisputeMessageRequest(chatDisputeId);

		await markNotificationAsRead(chatDisputeId);
		await createChatMessages(messageData, dealId);
	});
}

async function createChatMessages(messageData, dealId) {
	messageHistory.innerHTML = '';
	messageHistory.setAttribute('id', dealId);

	for (const messageDTO of messageData.message) {

		if (messageDTO.role === 'ADMIN' || messageDTO.role === 'SUPPORT') {
			await createOutMessage(messageDTO.message, messageDTO.createdAt);
		} else {
			const incomingMessage = document.createElement('div');

			incomingMessage.classList.add('incoming_msg');
			messageHistory.appendChild(incomingMessage);

			const incomingMessageImgWrapper = document.createElement('div');

			incomingMessageImgWrapper.classList.add('incoming_msg_img');

			incomingMessage.appendChild(incomingMessageImgWrapper);

			const incomingMessageImg = document.createElement('img');

			incomingMessageImg.src = 'https://ptetutorials.com/images/user-profile.png';

			incomingMessageImgWrapper.appendChild(incomingMessageImg);

			const recievedMessageWrapper = document.createElement('div');

			recievedMessageWrapper.classList.add('received_msg');

			incomingMessage.appendChild(recievedMessageWrapper);

			const recievedMessage = document.createElement('div');

			recievedMessage.classList.add('received_withd_msg');

			recievedMessageWrapper.appendChild(recievedMessage);

			if (messageDTO.messageType === 'FILE' && messageDTO?.contentType !== 'application/pdf') {

				const img = document.createElement('img');

				img.src = `${window.location.href}chats/messages/${messageDTO.id}`;

				const a = document.createElement('a');

				a.href = `${window.location.href}chats/messages/${messageDTO.id}`;
				a.download = decodeURI(messageDTO.message);

				a.appendChild(img);

				recievedMessage.appendChild(a);

				const dateSpan = document.createElement('span');

				dateSpan.classList.add('time_date');

				dateSpan.innerHTML = new Date(messageDTO.createdAt).toUTCString();

				recievedMessage.appendChild(dateSpan);

				messageHistory.appendChild(incomingMessage);
			}

			if (messageDTO.messageType === 'FILE' && messageDTO?.contentType === 'application/pdf') {
				// const iframe = document.createElement('a');

				// iframe.href = `${window.location.href}chats/messages/${messageDTO.id}`;
				// iframe.innerText = messageDTO.message;

				const a = document.createElement('a');

				a.href = `${window.location.href}chats/messages/${messageDTO.id}`;
				a.download = decodeURI(messageDTO.message);
				a.innerText = messageDTO.message;

				console.log('messageDTO.message ', messageDTO.message);

				// a.appendChild(iframe);

				// iframe.setAttribute('type', 'application/pdf');

				recievedMessage.appendChild(a);

				const dateSpan = document.createElement('span');

				dateSpan.classList.add('time_date');

				dateSpan.innerHTML = new Date(messageDTO.createdAt).toUTCString();

				recievedMessage.appendChild(dateSpan);

				messageHistory.appendChild(incomingMessage);
			}

			if (messageDTO.messageType === 'TEXT') {
				const message = document.createElement('p');

				message.innerHTML = messageDTO.message;

				recievedMessage.appendChild(message);

				const dateSpan = document.createElement('span');

				dateSpan.classList.add('time_date');

				dateSpan.innerHTML = new Date(messageDTO.createdAt).toUTCString();

				recievedMessage.appendChild(dateSpan);

				messageHistory.appendChild(incomingMessage);
			}
		}
	}

	await scrollToBottom();
}

async function chatDisputeMessageRequest(chatId) {
	return fetch(`/chats/chat/${chatId}/messages`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			return data;
		});
}

async function createNewClientMessage(payload) {
	console.log(payload);
	const incomingMessage = document.createElement('div');
	// console.log('message')

	incomingMessage.classList.add('incoming_msg');
	messageHistory.appendChild(incomingMessage);

	const incomingMessageImgWrapper = document.createElement('div');

	incomingMessageImgWrapper.classList.add('incoming_msg_img');

	incomingMessage.appendChild(incomingMessageImgWrapper);

	const incomingMessageImg = document.createElement('img');

	incomingMessageImg.src = 'https://ptetutorials.com/images/user-profile.png';

	incomingMessageImgWrapper.appendChild(incomingMessageImg);

	const recievedMessageWrapper = document.createElement('div');

	recievedMessageWrapper.classList.add('received_msg');

	incomingMessage.appendChild(recievedMessageWrapper);

	const recievedMessage = document.createElement('div');

	recievedMessage.classList.add('received_withd_msg');

	recievedMessageWrapper.appendChild(recievedMessage);

	const message = document.createElement('p');

	if (payload.messageType === 'FILE' && payload?.contentType !== 'application/pdf') {
		const img = document.createElement('img');

		const a = document.createElement('a');

		a.href = `${window.location.href}chats/messages/${payload.id}`;
		a.download = decodeURI(payload.message);

		const url = `${window.location.href}chats/messages/${payload.id}`;

		img.src = url;

		a.appendChild(img);

		recievedMessage.appendChild(a);

		const dateSpan = document.createElement('span');

		dateSpan.classList.add('time_date');

		dateSpan.innerHTML = new Date(payload.createdAt).toUTCString();

		recievedMessage.appendChild(dateSpan);

		messageHistory.appendChild(incomingMessage);
	}

	if (payload.messageType === 'FILE' && payload?.contentType === 'application/pdf') {
		const a = document.createElement('a');
		const url = `${window.location.href}chats/messages/${payload.id}`;

		a.href = url;

		a.innerText = payload.message;

		recievedMessage.appendChild(a);

		const dateSpan = document.createElement('span');

		dateSpan.classList.add('time_date');

		dateSpan.innerHTML = new Date(payload.createdAt).toUTCString();

		recievedMessage.appendChild(dateSpan);

		messageHistory.appendChild(incomingMessage);
	}

	if (payload.messageType === 'TEXT') {
		message.innerHTML = payload.message;

		recievedMessage.appendChild(message);

		const dateSpan = document.createElement('span');

		dateSpan.classList.add('time_date');

		dateSpan.innerHTML = new Date(payload.createdAt).toUTCString();

		recievedMessage.appendChild(dateSpan);

		messageHistory.appendChild(incomingMessage);
	}

	await scrollToBottom();
}

async function createOutMessage(messageText, incDate) {
	const outgoingMsg = document.createElement('div');

	outgoingMsg.classList.add('outgoing_msg');

	const messageWrapper = document.createElement('div');

	messageWrapper.classList.add('sent_msg');

	outgoingMsg.appendChild(messageWrapper);

	const message = document.createElement('p');

	message.innerHTML = messageText;

	messageWrapper.appendChild(message);

	const date = document.createElement('span');

	date.classList.add('time_date');

	if (incDate) {
		date.innerHTML = new Date(incDate).toUTCString();
	} else {
		date.innerHTML = new Date().toUTCString();
	}

	messageWrapper.appendChild(date);

	messageHistory.appendChild(outgoingMsg);
}

socket.once('connect', async (client) => {
	socket.onAny(async (payload) => {
		const { chatId } = payload;
		const activeChat = document.querySelector('.chat_list.active_chat');

		if (chatId === activeChat.getAttribute('id')) {
			await createNewClientMessage(payload);
		}
	});
});

const messageBtn = document.querySelector('#message-btn');

messageBtn.addEventListener('click', async() => {
	const activeChatId = document.querySelector('.chat_list.active_chat').getAttribute('id');
	const messageInput = document.querySelector('#message-input');
	const dto = messageInput.value.trim();

	if (dto !== '') {
		messageInput.value = '';

		await createOutMessage(dto);
		await sendAdminMessage(dto, activeChatId);

		const messageHistoryContainer = document.querySelector('.msg_history');

		messageHistoryContainer.scrollTop = messageHistoryContainer.scrollHeight;
	}
});

window.addEventListener('keypress', async (event) => {
	const messageInput = document.querySelector('#message-input');
	const dto = messageInput.value.trim();

	if (event.keyCode === 13 && event.ctrlKey && dto !== '') {

		const activeChatId = document.querySelector('.chat_list.active_chat').getAttribute('id');

		messageInput.value = '';

		await createOutMessage(dto);
		await sendAdminMessage(dto, activeChatId);

		await scrollToBottom();
	}
});

async function sendAdminMessage(dto, activeChatId) {
	socket.emit('dispute-chat-admin', { chatId: activeChatId, message: dto, messageType: 'TEXT' });
}

async function scrollToBottom() {
	const messageHistoryContainer = document.querySelector('.msg_history');

	messageHistoryContainer.scrollTop = messageHistoryContainer.scrollHeight;
}

const approveBtn = document.querySelector('#approve');
const cancelBtn = document.querySelector('#cancel');

approveBtn.addEventListener('click', async(e) => {
	const dealId = document.querySelector('.msg_history').getAttribute('id');
	const activeChat = document.querySelector('.active_chat');

	activeChat.remove();

	disputeVerdictBlock.classList.add('display-none');

	await verdictRequest({ dealId, approve: true });
	messageHistory.innerHTML = '';
});

cancelBtn.addEventListener('click', async(e) => {
	const dealId = document.querySelector('.msg_history').getAttribute('id');

	const activeChat = document.querySelector('.active_chat');

	activeChat.remove();

	disputeVerdictBlock.classList.add('display-none');

	await verdictRequest({ dealId, approve: false });
	messageHistory.innerHTML = '';
});

async function verdictRequest(data) {
	return fetch('/deals/verdict', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}).then((res) => {
		return res.json();
	}).then((data) => {
		console.log(data);
	});
}

async function  markNotificationAsRead(chatId) {
	return fetch(`/notifications/${chatId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ chatId })
	}).then((res) => {
		return res.json();
	}).then((data) => {
		console.log(data);
	});
}
