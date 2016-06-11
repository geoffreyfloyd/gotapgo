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
   ToolbarAndroid,
   View
} from 'react-native';
import Pusher from 'pusher-js/react-native';
import FlowBoard from './views/FlowBoard';

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
      
      this.state = {
         beers: null,
         flow: null,
         sort: 'score',
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
      var { beers, flow, sort } = this.state;
      
      // Wait for data
      if (!beers || !flow) {
         return this.renderLoadingIndicator();
      }

      // Render the flowboard
      return (
         <View style={styles.container}>
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
            <FlowBoard beers={beers} flow={flow} sort={sort} />
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
   },
   toolbar: {
      height: 56,
      backgroundColor: '#FDFDFD'
   }
});

AppRegistry.registerComponent('GoTapGo', () => GoTapGo);
