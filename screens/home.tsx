import React, { Component } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import firebase from '../database/firebase';
import { AntDesign } from '@expo/vector-icons';

export default class Home extends Component {
  memberArray: Array<Object> = [];

  constructor() {
    super();

    this.state = {
      memberList: []
    }
  }

  signOut = () => {
    // firebase.auth().signOut().then(() => {-
    this.props.navigation.navigate('Login')
    // })
    // .catch(error => this.setState({ errorMessage: error.message }))
  }

  UNSAFE_componentWillMount() {
    firebase
      .firestore()
      .collection("member_master").get().then((querySnapshot) => {
        console.log('Query - ', querySnapshot);

        querySnapshot.forEach((doc) => {
          this.memberArray.push(doc.data());
        });

        this.setState({ memberList: [...this.memberArray] });

        console.log('Data = ', this.memberArray);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.memberList}
          width='100%'
          keyExtractor={(index) => index.uid}
          renderItem={({ item }) =>
            <TouchableOpacity style={styles.item}
              onPress={() => this.props.navigation.navigate('Chat', { from: item.uid, to: item.uid })} >
              <View style={styles.listItem}>
                <Text style={styles.listText}>
                  {item.name}
                </Text>
                <Text style={styles.listText}>City: {item.city}</Text>
              </View>
              <View>
                <AntDesign name="right" size={24} color="black" />
              </View>
            </TouchableOpacity>}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: '#aac8dc'
  },
  item: {
    paddingHorizontal: 10,
    borderColor: '#868181',
    borderWidth: 1,
    marginLeft: 10,
    marginTop: 10,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  listItem: {
    flex: 1,
    marginBottom: 6
  },
  listText: {
    textTransform: 'capitalize',
    lineHeight: 30
  }
});
