// @flow
import React, { Component } from 'react';
import ReactNative, {
   AppRegistry,
   Dimensions,
   StyleSheet,
   Text,
   ProgressBarAndroid,
   ToolbarAndroid,
   View
} from 'react-native';
import Pusher from 'pusher-js/react-native';
import FlowBoard from './views/FlowBoard';
var WebSocketClient = require('websocket').client;

// // You need to set `window.navigator` to something in order to use the socket.io
// // client. You have to do it like this in order to use the debugger because the
// // debugger in React Native runs in a webworker and only has a getter method for
// // `window.navigator`.
// global.window = global.window || {};
// global.window.navigator = global.window.navigator || {};
// global.window.navigator.userAgent = 'react-native';

// // This must be below your `window.navigator` hack above
// import io from 'socket.io-client/socket.io';

const pusher = new Pusher('4fc24b61958c6d8b4e01');
const actionMap = {
   0: 'name',
   1: 'score',
   2: 'abv',
};
const viewTitle = {
   'name': 'by Name',
   'score': 'by Leader',
   'abv': 'by Highest ABV',
};

class GoTapGo extends Component {

   /***************************************************************
    * COMPONENT LIFECYCLE
    **************************************************************/
   constructor (props) {
      super(props);

      this.handleActionSelected = this.handleActionSelected.bind(this);
      this.handleFlowData = this.handleFlowData.bind(this);
      var dimensions = Dimensions.get('window');

      this.state = {
         beers: null,
         dimensions: dimensions,
         flow: null,
         sort: 'score',
         messages: [],
         page: 'chat',
      };
   }

   componentDidMount () {
      this._channel = pusher.subscribe('taproom');
      this._channel.bind('flowmeter-update', this.handleFlowData);
      // Get Beers
      fetch('http://apis.mondorobot.com/beers', {
         headers: {
            'Accept': 'application/json',
         }
      }).then(res => res.json()).then(json => this.setState({ gotBeers: true, beers: (this.state.beers || []).concat(json.beers) }));
      // Get Barrel Aged Beers
      fetch('http://apis.mondorobot.com/barrel-aged-beers', {
         headers: {
            'Accept': 'application/json',
         }
      }).then(res => res.json()).then(json => this.setState({ gotBarrelAgedBeers: true, beers: (this.state.beers || []).concat(json.barrel_aged_beers) }));
      // // Connect to chat room
      // this._socket = io('http://localhost:3000', {
      //    jsonp: false
      //    //transports: ['websocket'] // you need to explicitly tell it to use websockets
      // });
      // this._socket.on('chat', (msg) => {
      //    this.setState({
      //       messages: this.state.messages.concat([msg])
      //    });
      // });

      this._ws = new WebSocket('ws://localhost:3000');

      this._ws.onopen = () => {
         // // connection opened
         // ws.send('something');
         this._ws.send('hi');
      };

      this._ws.onmessage = (e) => {
         this.setState({
            messages: this.state.messages.concat([e.data])
         });
      };

      this._ws.onerror = (e) => {
         // an error occurred
         console.log(e.message);
      };

      this._ws.onclose = (e) => {
         // connection closed
         console.log(e.code, e.reason);
      };

      // this._client = new WebSocketClient();
      // this._client.on('connectFailed', function(error) {
      //    console.log('Connect Error: ' + error.toString());
      // });
      
      // this._client.on('connect', function(connection) {
      //    console.log('WebSocket Client Connected');
      //    connection.on('error', function(error) {
      //       console.log("Connection Error: " + error.toString());
      //    });
      //    connection.on('close', function() {
      //       console.log('echo-protocol Connection Closed');
      //    });
      //    connection.on('message', function(message) {
      //       if (message.type === 'utf8') {
      //          this.setState({
      //             messages: this.state.messages.concat([message.utf8Data])
      //          });
      //          console.log("Received: '" + message.utf8Data + "'");
      //       }
      //    });
      // });
      
      // this._client.connect('ws://localhost:3000/', 'echo-protocol');
   }

   componentWillUnmount () {
      this._channel.unbind('flowmeter-update', this.handleFlowData);
      pusher.unsubscribe('taproom');
   }

   /***************************************************************
    * EVENT HANDLING
    **************************************************************/
   handleActionSelected (actionIndex) {
      this.setState({
         sort: actionMap[actionIndex]
      });
   }

   handleFlowData (flow) {
      this.setState({
         flow: flow
      });
   }

   /***************************************************************
    * RENDERING
    **************************************************************/
   render () {
      var { beers, dimensions, flow, gotBeers, gotBarrelAgedBeers, messages, page, sort } = this.state;
      var pageInstance;

      // Wait for data
      if (!gotBeers || !gotBarrelAgedBeers || !flow) {
         return this.renderLoadingIndicator();
      }

      if (page === 'flowboard') {
         pageInstance = <FlowBoard beers={beers} dimensions={dimensions} flow={flow} sort={sort} />;
      }
      else {
         pageInstance = (
            <View>
               {messages.map(msg => {
                  return <Text style={styles.text}>{msg}</Text>;
               })}
            </View>
         );
      }

      // Render the flowboard
      return (
         <View style={styles.container} onLayout={event => this.setState({ dimensions: event.nativeEvent.layout })}>
            <ToolbarAndroid
               style={styles.toolbar}
               logo={require('./images/avery.png')}
               title={`Flow ${viewTitle[sort]}`}
               //titleColor="#FFF"
               actions={[
                  { title: 'Sort by Name', show: 'never' },
                  { title: 'Sort by Leader', show: 'never' },
                  { title: 'Sort by Highest ABV', show: 'never' },
               ]}
               onActionSelected={this.handleActionSelected} />
            {pageInstance}
         </View>
      );
   }

   renderLoadingIndicator () {
      return (
         <View style={styles.loadingContainer}>
            <ProgressBarAndroid styleAttr="Large" />
         </View>
      );
   }
}

/***************************************************************
 * STYLING
 **************************************************************/
const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#231f1f',
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#231f1f',
   },
   text: {
      flex: 1,
      color: '#FFF',
      textAlign: 'center',
      textAlignVertical: 'center',
   },
   toolbar: {
      height: 56,
      backgroundColor: '#f6f5f5'
   }
});

AppRegistry.registerComponent('GoTapGo', () => GoTapGo);
