// @flow
import React, { Component } from 'react';
import {
   AppRegistry,
   StyleSheet,
   Image,
   Text,
   RecyclerViewBackedScrollView,
   TouchableWithoutFeedback,
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
      if (nextProps.flow !== this.props.flow) {
         var result = this.calculateScoreboard(nextProps, this.state.scoreboard);

         this.setState({
            scoreboard: result,
            dataSource: this.getDataSource(result)
         });
      }
   }

   /***************************************************************
    * CALCULATIONS
    **************************************************************/   
   calculateScoreboard (props, scores) {
      // 
      var scoreboard = props.flow.map(flowItem => {
         var previous = first(scores, 'beer_id', flowItem.beer_id);
         var info = first(props.beers, 'id', flowItem.beer_id);
         var previousScore = previous ? previous.score : new Big(0);
         var change = this.calculateChange(flowItem, previous);
         
         return {
            ...flowItem,
            info: info,
            change: change,
            score: this.calculateScore(flowItem, previousScore, change),
         };
      });

      // Sort scoreboard by leading scores
      switch (props.sort) {
         case ('abv'):
            scoreboard.sort((a, b) => {
               return parseFloat(a.info ? a.info.abv : 0) > parseFloat(b.info ? b.info.abv : 0) ? -1 : 1;
            });
            break;
         case ('name'):
            scoreboard.sort((a, b) => {
               return a.beer_name > b.beer_name ? 1 : -1;
            });
            break;
         case ('score'):
            scoreboard.sort((a, b) => {
               return b.score.cmp(a.score);
            });
            break;
      }
      
      return scoreboard;
   }

   calculateChange (flowItem, previous) {
      if (!previous) {
         return new Big(0);
      }

      var prevAmt = new Big(previous.amount_remaining);
      var curAmt = new Big(flowItem.amount_remaining);       
      return prevAmt.minus(curAmt).times(500);
   }

   calculateScore (flowItem, previousScore, change) {
      return previousScore.plus(change);
   }

   getDataSource (data) {
      var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      return ds.cloneWithRows(data);
   }

   pressRow (row: object) {
      // TODO: Cheer for your beer!
   }

   /***************************************************************
    * RENDERING
    **************************************************************/
   render () {
      var { dataSource } = this.state;
      var { dimensions } = this.props;
      
      return (
         <ListView
            dataSource={dataSource}
            enableEmptySections={true}
            initialListSize={parseInt(dimensions.height / 70, 10)}
            renderRow={dimensions.width < 600 ? this.renderPhoneRow.bind(this) : this.renderTabletRow.bind(this)}
            renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
            renderSeparator={this.renderSeperator} />
      );
   }

   renderPhoneRow (row: object) {
      var abv, change, score, summary, imageSource;

      abv = row.info.abv;
      summary = row.info.style;
      imageSource = { uri: row.info.label_image.mobile || row.info.label_image.original };

      // Round Big values to integer
      change = Math.round(row.change);
      score = Math.round(row.score);

      return (
         <TouchableWithoutFeedback onPress={() => {
            this.pressRow(row);
         }}>
            <View style={styles.row}>
               <View style={styles.thumbPanel}>
                  <Image style={styles.thumb} source={imageSource} />
               </View>
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
         </TouchableWithoutFeedback>
      );
   }

   renderTabletRow (row: object) {
      var abv, change, score, summary, imageSource;

      // If we can't find the beer in the list
      // assume it's a tap room rarity
      if (!row.info) {
         imageSource = require('./images/trr.png');
      }
      else {
         abv = row.info.abv;
         summary = row.info.style;
         imageSource = { uri: row.info.label_image.mobile || row.info.label_image.original };
      }

      // Round Big values to integer
      change = Math.round(row.change);
      score = Math.round(row.score);

      return (
         <TouchableWithoutFeedback onPress={() => {
            this.pressRow(row);
         }}>
            <View style={styles.row}>
               <View style={styles.thumbPanelTab}>
                  <Image style={styles.thumb} source={imageSource} />
               </View>
               <View style={styles.labelPanelTab}>
                  <Text style={styles.nameTab}>{row.beer_name}</Text>
                  <Text style={styles.summary}>{summary}</Text>
               </View>
               <View style={styles.scorePanelTab}>
                  <Text style={styles.abvTab}>{abv}%</Text>
               </View>
               <View style={styles.scorePanelTab}>
                  <Text style={styles.changeTab}>{change ? '+' + change : ''}</Text>
               </View>
               <View style={styles.scorePanelTab}>
                  <Text style={styles.scoreTab}>{score}</Text>
               </View>
            </View>
         </TouchableWithoutFeedback>
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
      backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#111',
   }
}

const styles = StyleSheet.create({
   row: {
      flex: 1,
      flexDirection: 'row',
      padding: 8,
   },
   thumbPanel: {
      paddingRight: 4,
   },
   thumbPanelTab: {
      paddingRight: 10,
   },
   thumb: {
      width: 64,
      height: 64,
   },
   labelPanel: {
      flex: 3,
   },
   labelPanelTab: {
      flex: 4,
   },
   scorePanel: {
      flex: 1,
      paddingRight: 4,
   },
   scorePanelTab: {
      flex: 1,
      paddingRight: 4,
   },
   abv: {
      color: '#FFFFFF',
      textAlign: 'center',
   },
   abvTab: {
      flex: 1,
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 24,
      textAlignVertical: 'center',
   },
   score: {
      flex: 1,
      color: '#FFFFFF',
      textAlign: 'right',
      fontWeight: 'bold',
      textAlignVertical: 'center',
   },
   scoreTab: {
      flex: 1,
      color: '#FFFFFF',
      textAlign: 'right',
      fontWeight: 'bold',
      fontSize: 24,
      textAlignVertical: 'center',
      alignItems: 'center',
   },
   change: {
      flex: 1,
      color: '#00FF00',
      textAlign: 'right',
      fontWeight: 'bold',
      fontSize: 16,
      textAlignVertical: 'center',
   },
   changeTab: {
      flex: 1,
      color: '#00FF00',
      textAlign: 'right',
      fontWeight: 'bold',
      fontSize: 24,
      textAlignVertical: 'center',
      alignItems: 'center',
   },
   name: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      
      fontSize: 16,
   },
   nameTab: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 20,
   },
   summary: {
      color: '#e31b23',
      textAlign: 'center',
   },
});

export default FlowBoard;