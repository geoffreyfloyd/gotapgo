/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
   AppRegistry,
   StyleSheet,
   Text,
   View
} from 'react-native';
import Pusher from 'pusher-js/react-native';
import FlowBoard from './views/FlowBoard';

const pusher = new Pusher('4fc24b61958c6d8b4e01');

class GoTapGo extends Component {

   /***************************************************************
    * COMPONENT LIFECYCLE
    **************************************************************/
   constructor (props) {
      super(props);
      this.handleFlowData = this.handleFlowData.bind(this);
      this.state = {
         beers: null,
         flow: null,
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
      }).then(res => res.json()).then(json => this.setState({ beers: (this.state.beers || []).concat(json.beers) }));
      // Get Barrel Aged Beers
      fetch('http://apis.mondorobot.com/barrel-aged-beers', {
         headers: {
            'Accept': 'application/json',
         }
      }).then(res => res.json()).then(json => this.setState({ beers: (this.state.beers || []).concat(json.barrel_aged_beers) }));
   }

   componentWillUnmount () {
      this._channel.unbind('flowmeter-update', this.handleFlowData);
      pusher.unsubscribe('taproom');
   }

   /***************************************************************
    * EVENT HANDLING
    **************************************************************/
   handleFlowData (flow) {
      this.setState({
         flow: flow
      });
   }

   /***************************************************************
    * RENDERING
    **************************************************************/
   render () {
      var { beers, flow } = this.state;
      
      // Wait for data
      if (!beers || !flow) {
         return this.renderLoadingIndicator();
      }

      // Render the flowboard
      return (
         <View style={styles.container}>
            <FlowBoard beers={beers} flow={flow} />
         </View>
      );
   }

   renderLoadingIndicator () {
      return (
         <View style={styles.container}>
            <Text style={styles.text}>Loading...</Text>
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
      backgroundColor: '#111',
   },
   text: {
      color: '#FFF',
   }
});

AppRegistry.registerComponent('GoTapGo', () => GoTapGo);
