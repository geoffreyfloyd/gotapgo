// @flow
import React, { Component } from 'react';
import {
   AppRegistry,
   StyleSheet,
   Image,
   Text,
   RecyclerViewBackedScrollView,
   TouchableHighlight,
   View,
   ListView
} from 'react-native';
import Big from 'big.js';

class FlowBoard extends Component {
   /***************************************************************
    * COMPONENT LIFECYCLE
    **************************************************************/
   constructor (props) {
      super(props);
      var result = this.calculateScoreboard(this.props);
      this.state = {
         scoreboard: result,
         dataSource: this.getDataSource(result)
      };
   }

   componentWillReceiveProps (nextProps) {
      var result = this.calculateScoreboard(nextProps, this.state.scoreboard);

      // HACK: https://github.com/facebook/react-native/issues/5934
      this.setState({
         scoreboard: result,
         dataSource: this.getDataSource([])
      });
      this.setState({
         dataSource: this.getDataSource(result)
      });
   }

   /***************************************************************
    * CALCULATIONS
    **************************************************************/   
   calculateScoreboard (props, scores) {
      // 
      var scoreboard = props.flow.map(flowItem => {
         var previous = first(scores, 'beer_id', flowItem.beer_id);
         var previousScore = previous ? previous.score : new Big(0);
         var change = this.calculateChange(flowItem, previous);

         return {
            ...flowItem,
            change: change,
            score: this.calculateScore(flowItem, previousScore, change),
         };
      });

      // Sort scoreboard by leading scores
      scoreboard.sort((a, b) => {
         return b.score.cmp(a.score);
      });
      return scoreboard;
   }

   calculateChange (flowItem, previous) {
      if (!previous) {
         return new Big(0);
      }

      var prevAmt = new Big(previous.amount_remaining);
      var curAmt = new Big(flowItem.amount_remaining);       
      return prevAmt.minus(curAmt).times(1000);
   }

   calculateScore (flowItem, previousScore, change) {
      return previousScore.plus(change);
   }

   getDataSource (data) {
      var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      return ds.cloneWithRows(data);
   }

   /***************************************************************
    * RENDERING
    **************************************************************/
   render () {
      var { dataSource } = this.state;

      return (
         <ListView
            dataSource={dataSource}
            enableEmptySections={true}
            initialListSize={8}
            renderRow={this.renderRow.bind(this)}
            renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
            renderSeparator={this.renderSeperator} />
      );
   }

   renderRow (row) {
      var { beers } = this.props;
      var beer, abv, change, score, summary, imageSource;

      // Get beer info for this flowboard row
      beer = first(beers, 'id', row.beer_id);
      // If we can't find the beer in the list
      // assume it's a tap room rarity
      if (!beer) {
         imageSource = require('./images/trr.png');
      }
      else {
         abv = beer.abv;
         summary = beer.style;
         imageSource = { uri: beer.label_image.mobile || beer.label_image.original };
      }

      // Round Big values to integer
      change = Math.round(row.change);
      score = Math.round(row.score);

      return (
         <View style={styles.row}>
            <Image style={styles.thumb} source={imageSource} />
            <View style={styles.labelPanel}>
               <Text style={styles.name}>{row.beer_name}</Text>
               <Text style={styles.summary}>{summary}</Text>
               <Text style={styles.abv}>{abv}%</Text>
            </View>
            <View style={styles.scorePanel}>
               <Text style={styles.score}>{score}</Text>
               <Text style={styles.change}>{change ? '+' + change : ''}</Text>
            </View>
         </View>
      );
   }

   renderSeperator (sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
      return (
         <View
            key={`${sectionID}-${rowID}`}
            style={separatorStyle(adjacentRowHighlighted)}
         />
      );
   }
}

function first (list, prop, val) {
   if (!list) { 
      return null;
   }
   for (var i = 0; i < list.length; i++) {
      if (list[i][prop] === val) {
         return list[i];
      }
   }
   return null;
}

/***************************************************************
 * STYLING
 **************************************************************/
function separatorStyle (adjacentRowHighlighted) {
   return {
      height: adjacentRowHighlighted ? 4 : 1,
      backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#222',
   }
}

const styles = StyleSheet.create({
   row: {
      flex: 1,
      flexDirection: 'row',
      padding: 8,
   },
   thumb: {
      width: 64,
      height: 64,
   },
   labelPanel: {
      flex: 3,
   },
   scorePanel: {
      flex: 1,
      paddingRight: 4,
   },
   abv: {
      color: '#FFFFFF',
      textAlign: 'center',
   },
   score: {
      flex: 1,
      color: '#FFFFFF',
      textAlign: 'right',
      fontWeight: 'bold',
      textAlignVertical: 'center',
   },
   change: {
      flex: 1,
      color: '#00FF00',
      textAlign: 'right',
      fontWeight: 'bold',
      fontSize: 16,
      textAlignVertical: 'center',
   },
   name: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      
      fontSize: 16,
   },
   summary: {
      color: '#FF0000',
      textAlign: 'center',
   },
});

export default FlowBoard;