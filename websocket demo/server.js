import { WebSocketServer } from "ws"; // Look, we're using ES modules!

var wss = new WebSocketServer({ port: 3030 });
var clients = new Set();



wss.on("connection", (ws) => { // ws is the new client connection
  	console.log("Client connected");
	clients.add(ws);

	// broadcast to everyone
	ws.on("message", (message) => { 
		for (var client of clients) {
			if (client.readyState === 1) client.send(message.toString());
		}
	});

	ws.on("close", () => {
    	console.log("Client disconnected");
		clients.delete(ws);
	});
});



console.log("WebSocket server running on ws://localhost:3030");