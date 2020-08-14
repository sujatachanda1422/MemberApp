import React, { Component } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ImageBackground, Image } from 'react-native';
import firebase from '../database/firebase';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-community/async-storage';

const image = require("../images/bkg_home.png");
const userImg = require("../images/user.jpg");
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

  async UNSAFE_componentWillReceiveProps() {
    await this.isLoggedIn();

    if (loggedInUserMobile !== null) {
      this.props.navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile',
            { user: this.props.route.params.user }
          )}>
            <FontAwesome5 style={styles.addBtn} name="user-edit" size={24} color="black" />
          </TouchableOpacity>
        )
      });
    }
  }

  async isLoggedIn() {
    loggedInUserMobile = await AsyncStorage.getItem('loggedInMobile');

    console.log('loggedInMobile == ', loggedInUserMobile);
  }

  async UNSAFE_componentWillMount() {
    await this.isLoggedIn();

    if (loggedInUserMobile !== null) {
      this.props.navigation.navigate('Login');
    }

    // this.setState({
    //   memberList: [{
    //     name: 'dsadsada',
    //     city: 'dsadsada'
    //   }, {
    //     name: 'dsadsada',
    //     city: 'dsadsada'
    //   }, {
    //     name: 'dsadsada',
    //     city: 'dsadsada'
    //   }, {
    //     name: 'dsadsada',
    //     city: 'dsadsada'
    //   }]
    // });

    // return;

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
        <ImageBackground source={image} style={styles.image}>
          <View style={styles.overlay}>
            <FlatList
              data={this.state.memberList}
              width='100%'
              keyExtractor={(index) => index.mobile}
              renderItem={({ item }) =>
                <TouchableOpacity style={styles.item}
                  onPress={() => this.onMemberClick(item)} >
                  <View style={styles.listItemWrapper}>
                    <View style={styles.listItem}>
                      <Image source={(item.image && item.image !== '') ? item.image : userImg} style={styles.profileImg} />
                      <View style={{ paddingLeft: 40 }}>
                        <Text style={styles.nameText}>
                          {item.name}
                        </Text>
                        <Text style={styles.listText}>From {item.city}</Text>
                      </View>
                    </View>
                    <View style={{ position: 'absolute', right: 10 }}>
                      <AntDesign name="right" size={24} color="#dcdcdc" />
                    </View>
                  </View>
                </TouchableOpacity>}
            />
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex"
  },
  overlay: {
    backgroundColor: 'rgba(199,199,199,0.3)',
    height: '100%',
    flexDirection: "column",
    justifyContent: "center",
    padding: 20
  },
  image: {
    flex: 1,
    justifyContent: "center",
    zIndex: 10
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginLeft: -25,
    position: 'absolute'
  },
  item: {
    paddingHorizontal: 10,
    borderColor: '#868181',
    marginBottom: 20,
  },
  listItemWrapper: {
    display: 'flex',
    paddingLeft: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  listItem: {
    display: 'flex',
    paddingVertical: 15,
    marginBottom: 6,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  listText: {
    textTransform: 'capitalize',
    lineHeight: 30
  },
  nameText: {
    textTransform: 'capitalize',
    lineHeight: 30,
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold'
  },
  addBtn: {
    color: '#ffff',
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 5
  }
});
