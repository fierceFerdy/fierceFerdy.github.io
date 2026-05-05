var ws = new WebSocket("ws://localhost:3030");

ws.onmessage = (event) => {
	var data = JSON.parse(event.data);
	console.log("Message from server:", data);
};

ws.onopen = () => {
	console.log("Connected to WebSocket server");
};

ws.onclose = () => {
	console.log("Disconnected from WebSocket server");
};

document.getElementById('sendButton').addEventListener('click', () => {
	const message = document.getElementById('messageInput').value;
	sendMessage(message);
});



function sendMessage(text){
	ws.send(JSON.stringify({
		user: "Anonimouse",
		text,
		time: Date.now()
	}));
}