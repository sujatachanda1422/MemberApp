import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import firebase from '../database/firebase';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-community/async-storage';

const image = require("../images/bkg_home.png");
const userImg = require("../images/user.jpg");
let loggedInUserMobile: string | null | undefined = null;
let subscriptionResult: firebase.firestore.DocumentData | undefined = {};
let chatListResult: firebase.firestore.DocumentData[] = [];

export default class Home extends Component {
  memberArray: Array<Object> = [];
  db: firebase.firestore.Firestore;
  _unsubscribe: any = () => { };

  constructor() {
    super();

    this.state = {
      isLoading: false,
      memberList: [],
      memberDetails: {}
    };

    this.db = firebase.firestore();
  }

  UNSAFE_componentWillReceiveProps() {
    this.getMemberList();
  }

  getMemberList() {
    this.setState({
      isLoading: true
    });

    this.db
      .collection("member_list")
      .get().then((querySnapshot) => {
        this.setState({
          isLoading: false
        });

        let docData;

        // Reset data
        this.memberArray = [];
        this.setState({ memberList: [] });

        querySnapshot.forEach((doc) => {
          docData = doc.data();

          if ((!loggedInUserMobile || docData.mobile !== loggedInUserMobile)
            && docData.name) {
            this.memberArray.push(docData);
          }
        });

        this.setState({ memberList: [...this.memberArray] });
      })
      .catch(error => {
        this.setState({
          isLoading: false
        });
        console.log('List error = ', error);
      });
  }

  async isLoggedIn() {
    loggedInUserMobile = await AsyncStorage.getItem('loggedInMobile');

    console.log('loggedInMobile == ', loggedInUserMobile);
  }

  async UNSAFE_componentWillMount() {
    await this.isLoggedIn();

    if (loggedInUserMobile !== null) {
      this.props.navigation.navigate('Login', { mobile: loggedInUserMobile });
    } else {
      this.getMemberList();
    }

    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      await this.isLoggedIn();

      if (loggedInUserMobile !== null) {
        this.props.navigation.setOptions({
          headerRight: () => (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile',
              { user: this.props.route.params.user }
            )}>
              <FontAwesome5 style={styles.editProfileBtn} name="user-edit" size={24} color="black" />
            </TouchableOpacity>
          )
        });

        this.checkChatList();
        this.checkForSubscription();
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  checkChatList() {
    this.db.collection("chat_list")
      .doc(loggedInUserMobile)
      .collection('members')
      .get()
      .then((querySnapshot) => {
        let docData: firebase.firestore.DocumentData[] = [];

        querySnapshot.forEach(doc => {
          return docData.push(doc.data().mobile);
        });

        chatListResult = docData;
      })
      .catch(error => {
        console.log('Error = ', error);
      });
  }

  onMemberClick(item: { mobile: firebase.firestore.DocumentData; }) {
    // For not registered user
    if (!loggedInUserMobile) {
      this.props.navigation.navigate('Register', { verified: false });
      return;
    }

    this.verifyOnMemberClick(item);
  }

  showSubscriptionError(msg: string) {
    Alert.alert('', msg,
      [
        {
          text: 'OK',
          onPress: () =>
            this.props.navigation.navigate('Subscription',
              {
                user: this.props.route.params.user
              })
        },
        {
          text: 'Cancel'
        }
      ]);
  }

  checkForSubscription() {
    this.db.collection("subscription_list")
      .doc(loggedInUserMobile)
      .get()
      .then((doc) => {
        subscriptionResult = doc.data();

        console.log('Docdata = ', subscriptionResult);
      })
      .catch(error => {
        console.log('Error = ', error);
      });
  }

  verifyOnMemberClick(clickedMember: { mobile: firebase.firestore.DocumentData; }) {
    // Free 1 member chat
    if (!chatListResult.length) {
      this.props.navigation.navigate('Chat',
        {
          from: this.props.route.params.user,
          user: clickedMember,
          isSubscribed: false
        });

      return;
    }

    if (subscriptionResult) {
      const today = new Date().getTime();
      const expiryDate = new Date(subscriptionResult.expiry_date).getTime();

      if (subscriptionResult.status === 'accepted') {
        if (today > expiryDate) {
          this.showSubscriptionError('Your subscription has been expired, please re-subscribe again.');
        } else if (!subscriptionResult.remaining_chat) {
          this.showSubscriptionError('Your chat limit has exhausted, please re-subscribe again.');
        } else if (subscriptionResult.remaining_chat) {
          this.props.navigation.navigate('Chat',
            {
              from: this.props.route.params.user,
              user: clickedMember,
              isSubscribed: true
            });
        }
      } else if (subscriptionResult.status === 'pending') {
        // If subscription is not expired then user can chat with old contacted members
        if (expiryDate && (today <= expiryDate)
          && chatListResult.indexOf(clickedMember.mobile) > -1) {
          this.props.navigation.navigate('Chat',
            {
              from: this.props.route.params.user,
              user: clickedMember,
              isSubscribed: true
            });
        } else {
          Alert.alert('', 'Your subscription request is under pending state and you will be notified once its approved. Thank you!');
        }
      }
    } else {
      this.props.navigation.navigateq('Subscription',
        {
          user: this.props.route.params.user
        });
    }
  }

  getAge(dob: string | number | Date) {
    return Math.floor((new Date() - new Date(dob).getTime()) / 3.15576e+10);
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.preloader}>
          <ActivityIndicator size="large" color="#9E9E9E" />
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <ImageBackground source={image} style={styles.image}>
          <View style={styles.overlay}>
            <FlatList
            contentContainerStyle={styles.listContainer}
              data={this.state.memberList}
              keyExtractor={(index) => index.mobile}
              renderItem={({ item }) =>
                <TouchableOpacity style={styles.item}
                  onPress={() => this.onMemberClick(item)} >
                  <View style={styles.listItemWrapper}>
                    <View style={styles.listItem}>
                      <Image source={(item.image && item.image !== '') ? { uri: item.image } : userImg} style={styles.profileImg} />
                      <View style={{ paddingLeft: 40 }}>
                        <Text style={styles.nameText}>
                          {item.name}
                        </Text>
                        <View style={styles.listDesc}>
                          <Text style={{ textTransform: 'capitalize' }}>
                            {item.city}
                          </Text>
                          {(item.dob != null && item.dob !== '') &&
                            <View style={{ flexDirection: 'row' }}>
                              <Text>,</Text>
                              <Text style={{paddingHorizontal: 5}}>
                                {this.getAge(item.dob)}
                              </Text>
                            </View>
                          }
                        </View>
                      </View>
                    </View>
                    <View style={{ position: 'absolute', right: 5 }}>
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
    flex: 1
  },
  listContainer: {
    width: '100%',
    paddingTop: 20,
    paddingLeft: 15,
    paddingRight: 10
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
    marginBottom: 15
  },
  listItemWrapper: {
    display: 'flex',
    paddingLeft: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  listItem: {
    display: 'flex',
    paddingVertical: 5,
    marginBottom: 6,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  listDesc: {
    flexDirection: 'row',
    paddingVertical: 5
  },
  nameText: {
    textTransform: 'capitalize',
    lineHeight: 30,
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold'
  },
  editProfileBtn: {
    color: '#ffff',
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  }
});
