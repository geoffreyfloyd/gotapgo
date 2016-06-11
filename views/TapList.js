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
      var result = this.calculateScoreboard(this.props);
      this.state = {
         scoreboard: result,
         dataSource: this.getDataSource(result.slice(0, 7))
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
         dataSource: this.getDataSource(result.slice(0, 7))
      });
   }

   /***************************************************************
    * CALCULATIONS
    **************************************************************/   
   calculateScoreboard (props, scores) {
      var scoreboard = props.data.map(beerFlow => {
         return {
            ...beerFlow,
            score: this.calculateScore(beerFlow, scores)
         };
      });

      scoreboard.sort((a, b) => {
         return a.score < b.score ? 1 : a.score === b.score ? 0 : -1;
      });
      return scoreboard;
   }

   calculateScore (beerFlow, scores) {
      if (!scores) {
         return 0;
      }
      var previous = first(scores, 'beer_id', beerFlow.beer_id);
      if (!previous) {
         return 0;
      }

      if (String(previous.amount_remaining) === String(beerFlow.amount_remaining)) {
         return previous.score;
      }

      var newScore = previous.score + ((previous.amount_remaining - beerFlow.amount_remaining) * 1000);
      if (isNaN(newScore) || (!newScore && newScore !== 0)) {
         return previous.score;
      }
      else {
         return newScore;
      }
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
            renderRow={this.renderRow} />
      );
   }

   renderRow (row) {
      var beer, abv, score, summary, imageSource;
      beer = first(beers, 'id', row.beer_id);
      if (!beer) {
         summary = 's';
         imageSource = require('./images/trr.png');
      }
      else {
         abv = beer.abv; // abv ? `${abv}%` : ''
         summary = beer.style;
         imageSource = { uri: beer.label_image.original };
      }

      score = Math.round(row.score);
      if ((!score && score !== 0) || isNaN(score)) {
         score = 'NaN';
      }
      else {
         score = String(score);
      }

      // <View style={styles.abv}>
      //    <Text style={styles.abvText}>{score}</Text>
      // </View>
      return (
         <View style={styles.row}>
            <Image style={styles.thumb} source={imageSource} />
            <View style={styles.right}>
               <Text style={styles.title}>{row.beer_name}</Text>
               <Text style={styles.summary}>{summary}</Text>
               <Text style={styles.abvText}>{score}</Text>
            </View>
         </View>
      );
   }
}

function first (list, prop, val) {
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
      fontWeight: 'bold',
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