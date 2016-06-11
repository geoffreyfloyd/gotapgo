var http = require('http')

var server = http.createServer(function(request, response) {
   console.log((new Date()) + ' Received request for ' + request.url);
   response.writeHead(404);
   response.end();
});
server.listen(3000);

var io = require('socket.io')(server);

var sockets = [];
io.on('connection', function (socket) {
   
   // Store reference of all socket connections
   sockets.push(socket);
   
   // Join the chat room
   socket.join('chat');

   // Announce the new user's arrival
   announceArrival(socket);

   // socket.on('chat', function (data) {     
   //    console.log(data);
   // });
});

function announceArrival (socket) {
   sockets.forEach(s => s.emit('chat', { msg: socket.id + ' joined the chatroom!' }));
}
