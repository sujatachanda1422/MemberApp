import React, { Component } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import firebase from '../database/firebase';
import { AntDesign } from '@expo/vector-icons';

export default class Home extends Component {
  memberArray: Array<Object> = [];
  db: firebase.firestore.Firestore;

  constructor() {
    super();

    this.state = {
      memberList: [],
      memberDetails: {}
    };

    this.db = firebase.firestore();
  }

  signOut = () => {
    // firebase.auth().signOut().then(() => {-
    this.props.navigation.navigate('Login')
    // })
    // .catch(error => this.setState({ errorMessage: error.message }))
  }

  UNSAFE_componentWillMount() {
    this.setState({ memberDetails: this.props.route.params.user });

    this.db
      .collection("member_list")
      .get().then((querySnapshot) => {
        let docData;

        querySnapshot.forEach((doc) => {
          docData = doc.data();

          if (docData.mobile !== this.state.memberDetails.mobile) {
            this.memberArray.push(docData);
          }
        });

        this.setState({ memberList: [...this.memberArray] });

        console.log('Data = ', this.memberArray);
      });
  }

  checkForSubscription(item) {
    this.db.collection("chat_list")
      .doc(this.state.memberDetails.mobile)
      .collection('members')
      .get()
      .then((querySnapshot) => {
        const chatMemberLength = querySnapshot.size;
        let docData: firebase.firestore.DocumentData[] = [];

        querySnapshot.forEach(doc => {
          return docData.push(doc.data().mobile);
        });

        // console.log('Data = ', docData, this.state.memberDetails, item);

        // Free 1 member chat
        if (docData.indexOf(item.mobile) > -1) {
          this.props.navigation.navigate('Chat',
            {
              from: this.state.memberDetails,
              user: item
            });
        } else {
          this.props.navigation.navigate('Subscription', { user: this.state.memberDetails });
        }
      })
      .catch(error => {
        console.log('Error = ', error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.memberList}
          width='100%'
          keyExtractor={(index) => index.mobile}
          renderItem={({ item }) =>
            <TouchableOpacity style={styles.item}
              onPress={() => this.checkForSubscription(item)} >
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
