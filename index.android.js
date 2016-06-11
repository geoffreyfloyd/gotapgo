// @flow
import React, { Component } from 'react';
import ReactNative, {
   AppRegistry,
   Dimensions,
   StyleSheet,
   Text,
   ProgressBarAndroid,
   TextInput,
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

      // Bind event handlers to instance
      this.handleActionSelected = this.handleActionSelected.bind(this);
      this.handleFlowData = this.handleFlowData.bind(this);

      // Get initial device dimensions (orientation changes handled by View.onLayout)
      var dimensions = Dimensions.get('window');

      // Set initial state of application
      this.state = {
         beers: null,
         dimensions: dimensions,
         flow: null,
         sort: 'score',
         messages: [],
         page: 'flowboard',
         text: ''
      };
   }

   componentDidMount () {
      // Subscribe to flowmeter updates from the taproom
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

      // Connect to a barebome homebrew chatroom socket server
      this._ws = new WebSocket('ws://home.hoomanlogic.com:3050');

      this._ws.onopen = () => {
         // // connection opened
         // ws.send('something');
         //this._ws.send('hi');
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
   }

   componentWillUnmount () {
      this._channel.unbind('flowmeter-update', this.handleFlowData);
      pusher.unsubscribe('taproom');
   }

   /***************************************************************
    * EVENT HANDLING
    **************************************************************/
   handleActionSelected (actionIndex) {
      if (actionIndex === 3) {
         this.setState({
            page: this.state.page === 'flowboard' ? 'chat' : 'flowboard'
         });
      }
      else {
         this.setState({
            sort: actionMap[actionIndex]
         });
      }
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
      var pageInstance, title;

      // Wait for data
      if (!gotBeers || !gotBarrelAgedBeers || !flow) {
         return this.renderLoadingIndicator();
      }

      if (page === 'flowboard') {
         pageInstance = <FlowBoard beers={beers} dimensions={dimensions} flow={flow} sort={sort} />;
         title = `Flow ${viewTitle[sort]}`;
      }
      else {
         pageInstance = (
            <View>
               <View style={styles.container}>
                  {messages.map((msg, index) => {
                     return <Text key={index} style={styles.text}>{msg}</Text>;
                  })}
               </View>
               <TextInput
                  style={{height: 40, color: '#fff', borderColor: 'gray', borderWidth: 1}}
                  onChangeText={(text) => this.setState({text})}
                  onSubmitEditing={() => {
                     this._ws.send(this.state.text);
                     this.setState({ text: '' });
                  }}
                  value={this.state.text} />
            </View>
         );
         title = 'Beer Talk';
      }

      // Render the flowboard
      return (
         <View style={styles.container} onLayout={event => this.setState({ dimensions: event.nativeEvent.layout })}>
            <ToolbarAndroid
               style={styles.toolbar}
               logo={require('./images/avery.png')}
               title={title}
               actions={[
                  { title: 'Sort by Name', show: 'never' },
                  { title: 'Sort by Leader', show: 'never' },
                  { title: 'Sort by Highest ABV', show: 'never' },
                  { title: page === 'flowboard' ? 'Join Chatroom (Alpha)' : 'Check Flowboard', show: 'never' },
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
