// @flow
import React, { Component } from 'react';
import {
   AppRegistry,
   StyleSheet,
   Image,
   Text,
   View,
   ListView
} from 'react-native';

import beers from './beers.json';

class TapList extends Component {
   /***************************************************************
    * COMPONENT LIFECYCLE
    **************************************************************/
   constructor (props) {
      super(props);
      var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.state = {
         data: ds.cloneWithRows(this.props.data.length ? this.props.data : [{ beer_name: 'No Data Beer' }]),
      };
   }

   componentWillReceiveProps (nextProps) {
      var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.setState({
         data: ds.cloneWithRows(nextProps.data.length ? nextProps.data : [{ beer_name: 'No Data Beer' }]),
      });
   }

   /***************************************************************
    * RENDERING
    **************************************************************/
   render () {
      var { data } = this.state;
      return (
         <ListView
            dataSource={data}
            renderRow={this.renderRow} />
      );
   }

   renderRow (row) {
      var beer, abv, summary, imageSource;
      for (var i = 0; i < beers.length; i++) {
         if (beers[i].id === row.beer_id) {
            beer = beers[i];
            break;
         }
      }
      if (!beer) {
         summary = '';
         imageSource = require('./images/trr.png');
      }
      else {
         abv = beer.abv;
         summary = beer.style;
         imageSource = { uri: beer.label_image.original };
      }

      return (
         <View style={styles.row}>
            <Image style={styles.thumb} source={imageSource} />
            <View style={styles.right}>
               <Text style={styles.title}>{row.beer_name}</Text>
               <Text style={styles.summary}>{summary}</Text>
               
            </View>
            <View style={styles.abv}>
               <Text style={styles.abvText}>{abv ? `${abv}%` : ''}</Text>
            </View>
         </View>
      );
   }
}

/***************************************************************
 * STYLING
 **************************************************************/
const styles = StyleSheet.create({
   row: {
      flex: 1,
      flexDirection: 'row',
      padding: 5,
   },
   thumb: {
      width: 64,
      height: 64,
   },
   abv: {
      width: 40,
   },
   abvText: {
      color: '#FFFFFF',
      textAlign: 'right',
   },
   right: {
      flex: 1,
   },
   title: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 16,
   },
   summary: {
      color: '#FF0000',
      textAlign: 'center',
   },
   text: {
      color: '#FFFFFF',
      flex: 1,
   },
   // welcome: {
   //    fontSize: 20,
   //    textAlign: 'center',
   //    margin: 10,
   // },
   // instructions: {
   //    textAlign: 'center',
   //    color: '#333333',
   //    marginBottom: 5,
   // },
});

export default TapList;