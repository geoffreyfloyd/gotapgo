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
import TapList from './views/TapList';

const pusher = new Pusher('4fc24b61958c6d8b4e01');

class GoTapGo extends Component {

   /***************************************************************
    * COMPONENT LIFECYCLE
    **************************************************************/
   constructor (props) {
      super(props);
      this.handleTaproomData = this.handleTaproomData.bind(this);
      this.state = {
         data: []
      };
   }

   componentDidMount () {
      this._channel = pusher.subscribe('taproom');
      this._channel.bind('flowmeter-update', this.handleTaproomData);
   }

   componentWillUnmount () {
      this._channel.unbind('flowmeter-update', this.handleTaproomData);
      pusher.unsubscribe('taproom');
   }

   /***************************************************************
    * EVENT HANDLING
    **************************************************************/
   handleTaproomData (data) {
      this.setState({
         data: data
      });
   }

   /***************************************************************
    * RENDERING
    **************************************************************/
   render () {
      return (
         <View style={styles.container}>
            <TapList data={this.state.data} />
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
      backgroundColor: 'black',
   },
});

AppRegistry.registerComponent('GoTapGo', () => GoTapGo);
