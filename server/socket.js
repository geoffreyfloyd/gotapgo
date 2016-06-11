var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
   console.log((new Date()) + ' Received request for ' + request.url);
   response.writeHead(404);
   response.end();
});

server.listen(3050, function() {
   console.log('Socket Server is listening on port 3050');
});

var wss = new WebSocketServer({
   httpServer: server,
   // You should not use autoAcceptConnections for production
   // applications, as it defeats all standard cross-origin protection
   // facilities built into the protocol and the browser.  You should
   // *always* verify the connection's origin and decide whether or not
   // to accept it.
   autoAcceptConnections: false
});

function originIsAllowed(origin) {
   // put logic here to detect whether the specified origin is allowed.
   return true;
}

var connections = [];
var userNameGen = 1;
wss.on('request', function(request) {
   if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
   }

   var connection = request.accept(null, request.origin);
   connections.push(connection);
   console.log((new Date()) + ' Connection accepted.');

   var connectionName = 'BeerFan' + userNameGen;
   userNameGen++;

   // Broadcast to all
   connections.forEach(function (conn) {
      conn.sendUTF(connectionName + ' joined the chat!');
   });
   
   connection.on('message', function(message) {
      if (message.type === 'utf8') {
         console.log('Received Message: ' + message.utf8Data);

         // Broadcast to all
         connections.forEach(function (conn) {
            conn.sendUTF(connectionName + ': ' + message.utf8Data);
         });
      }
      else if (message.type === 'binary') {
         console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
         connection.sendBytes(message.binaryData);
      }
   });
   connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      // Remove the connection from the list
      connections = connections.slice().filter(conn => conn !== connection);
   });
});
