import React, { Component } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import firebase from '../database/firebase';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-community/async-storage';

let loggedInUserMobile: string | null | undefined = null;

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

  UNSAFE_componentWillReceiveProps() {
    this.isLoggedIn();

    if (loggedInUserMobile !== null) {
      this.props.navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile',
            { user: this.props.route.params.user }
          )}>
            <Text style={styles.addBtn}>
              Profile
            </Text>
          </TouchableOpacity>
        )
      });
    }
  }

  async isLoggedIn() {
    loggedInUserMobile = await AsyncStorage.getItem('loggedInMobile');

    console.log('loggedInMobile == ', loggedInUserMobile);
  }

  UNSAFE_componentWillMount() {
    this.isLoggedIn();

    if (loggedInUserMobile !== null) {
      this.props.navigation.navigate('Login');
    }

    this.db
      .collection("member_list")
      .get().then((querySnapshot) => {
        let docData;

        querySnapshot.forEach((doc) => {
          docData = doc.data();

          if ((!loggedInUserMobile || docData.mobile !== loggedInUserMobile)
            && docData.name) {
            this.memberArray.push(docData);
          }
        });

        this.setState({ memberList: [...this.memberArray] });

        console.log('Data = ', this.memberArray);
      });
  }

  onMemberClick(item: { mobile: firebase.firestore.DocumentData; }) {
    // For not registered user
    if (!loggedInUserMobile) {
      this.props.navigation.navigate('Register', { verified: false });
      return;
    }

    this.db.collection("chat_list")
      .doc(loggedInUserMobile)
      .collection('members')
      .get()
      .then((querySnapshot) => {
        const chatMemberLength = querySnapshot.size;
        let docData: firebase.firestore.DocumentData[] = [];

        querySnapshot.forEach(doc => {
          return docData.push(doc.data().mobile);
        });

        // console.log('Data = ', docData, loggedInUserMobile, item);

        // Free 1 member chat
        if (!docData.length || docData.indexOf(item.mobile) > -1) {
          this.props.navigation.navigate('Chat',
            {
              from: this.props.route.params.user,
              user: item
            });
        } else {
          this.checkForSubscription(item);
        }
      })
      .catch(error => {
        console.log('Error = ', error);
      });
  }

  checkForSubscription(clickedMember: { mobile: firebase.firestore.DocumentData; }) {
    this.db.collection("subscription_list")
      .doc(loggedInUserMobile)
      .get()
      .then((doc) => {
        const docData: firebase.firestore.DocumentData = doc.data();

        if (docData) {
          const today = new Date().getTime();
          const expiryDate = new Date(docData.expiry_date).getTime();
        }

        if (docData && (docData.status === 'accepted'
          && today <= expiryDate && docData.remaining_chat != 0)) {
          this.props.navigation.navigate('Chat',
            {
              from: this.props.route.params.user,
              user: clickedMember,
              isSubscribed: true
            });
        } else {
          this.props.navigation.navigate('Subscription', { user: this.props.route.params.user });
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
              onPress={() => this.onMemberClick(item)} >
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
  },
  addBtn: {
    color: '#000',
    fontSize: 16,
    marginRight: 20,
    borderRadius: 2,
    fontWeight: 'bold',
    backgroundColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 5
  }
});
