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
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-community/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import FilterModal from './homeFilterModal';

const image = require("../images/bkg_home.png");
const boyImg = require("../images/boy.jpg");
const girlImg = require("../images/girl.jpg");

let loggedInUserMobile: string | null | undefined = null;
let subscriptionResult: firebase.firestore.DocumentData | undefined = {};
let chatListResult: firebase.firestore.DocumentData[] = [];
let filterObj = {
  age1822: false,
  age2330: false,
  age3140: false,
  age40: false,
  male: false,
  female: false,
  all: false
};

export default class Home extends Component {
  memberArray: Array<Object> = [];
  db: firebase.firestore.Firestore;
  _unsubscribe: any = () => { };

  constructor() {
    super();

    this.state = {
      isLoading: false,
      memberList: [],
      memberDetails: {},
      showFilterModal: false
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
      this.props.navigation.navigate('HomeComp',
        {
          screen: 'Login',
          params: {
            mobile: loggedInUserMobile
          }
        });
    } else {
      this.getMemberList();
    }

    this._unsubscribe = this.props.navigation.addListener('focus', async () => {
      await this.isLoggedIn();

      if (loggedInUserMobile !== null) {
        this.props.navigation.setOptions({
          headerRight: () => {
            return <TouchableOpacity onPress={() => this.openFilter()}>
              <FontAwesome name="filter" size={24} color="white" style={{ marginRight: 25 }} />
            </TouchableOpacity>;
          }
        });

        this.checkChatList();
        this.checkForSubscription();
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  openFilter() {
    this.setState({ showFilterModal: true });


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
      this.props.navigation.navigate('HomeComp',
        {
          screen: 'Register',
          params: {
            verified: false
          }
        }
      )
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
            this.props.navigation.navigate('HomeComp',
              {
                screen: 'Subscription',
                params: {
                  user: this.props.route.params.user
                }
              }
            )
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
      })
      .catch(error => {
        console.log('Error = ', error);
      });
  }

  navigateToChat(screen: string, from: any,
    user: { mobile: firebase.firestore.DocumentData; }, isSubscribed: boolean) {
    this.props.navigation.navigate('HomeComp',
      {
        screen,
        params: {
          from,
          user,
          isSubscribed
        }
      });
  }

  verifyOnMemberClick(clickedMember: { mobile: firebase.firestore.DocumentData; }) {
    // Free 1 member chat
    if (!chatListResult.length) {
      this.navigateToChat('Chat', this.props.route.params.user, clickedMember, false);
      return;
    }

    if (subscriptionResult) {
      const today = new Date().getTime();
      const expiryDate = new Date(subscriptionResult.expiry_date).getTime();

      if (subscriptionResult.status === 'accepted') {
        if (today > expiryDate) {
          this.showSubscriptionError('Your subscription has been expired, please re-subscribe again.');
        } else if (!subscriptionResult.remaining_chat) {
          if (chatListResult.indexOf(clickedMember.mobile) > -1) {
            this.navigateToChat('Chat', this.props.route.params.user, clickedMember, true);
            return;
          }

          this.showSubscriptionError('Your chat limit has exhausted, please re-subscribe again.');
        } else if (subscriptionResult.remaining_chat) {
          this.navigateToChat('Chat', this.props.route.params.user, clickedMember, true);
        }
      } else if (subscriptionResult.status === 'pending') {
        // If subscription is not expired then user can chat with old contacted members
        if (expiryDate && (today <= expiryDate)
          && chatListResult.indexOf(clickedMember.mobile) > -1) {
          this.navigateToChat('Chat', this.props.route.params.user, clickedMember, true);
        } else {
          Alert.alert('', 'Your subscription request is under pending state and you will be notified once its approved. Thank you!');
        }
      }
    } else {
      this.props.navigation.navigate('HomeComp',
        {
          screen: 'Subscription',
          params: {
            user: this.props.route.params.user
          }
        }
      )
    }
  }

  getAge(dob: number) {
    return Math.floor((new Date().getTime() - dob) / 3.15576e+10);
  }

  onFilterSelect = (data: { age1822: any; age2330: any; age3140: any; age40: any; all: any; male: any; female: any; }) => {
    this.setState({ showFilterModal: false });

    if (data.isClear) {
      this.getMemberList();
    } else if (data.search) {
      this.getFilteredList(data);
    }

    if (!data.close) {
      filterObj = { ...data };
    }

    console.log("Mount now", data);
  }

  getTimeFromYear(year: number) {
    const dateNow = new Date();
    return new Date(dateNow.getFullYear() - year, dateNow.getMonth(), dateNow.getDate()).getTime();
  }

  getFilteredData(query: firebase.firestore.Query<firebase.firestore.DocumentData>,
    stopLoading?: boolean) {
    return query
      .orderBy('dob', 'desc')
      .get().then(querySnapshot => {
        let docData;

        querySnapshot.forEach((doc) => {
          docData = doc.data();

          if (docData.mobile !== loggedInUserMobile) {
            this.memberArray.push(docData);
          }
        });

        if (stopLoading) {
          this.setState({
            memberList: [...this.memberArray],
            isLoading: false
          });
        }
        else {
          this.setState({ memberList: [...this.memberArray] });
        }
      })
      .catch((error) => {
        this.setState({
          isLoading: false
        });
        console.log('List error = ', error);
      });
  }

  getFilteredList(filterObj: { age1822: any; age2330: any; age3140: any; age40: any; all: any; male: any; female: any; }) {
    let query = this.db.collection("member_list");
    let start, end;
    let promiseArr = [], type: string | any[] = [];

    this.memberArray = [];

    // Reset data
    this.setState({ memberList: [], isLoading: true });

    if (filterObj.age1822) {
      start = this.getTimeFromYear(18);
      end = this.getTimeFromYear(22);
      const age1822 = this.getFilteredData(query.where('dob', '>=', end).where('dob', '<=', start));
      promiseArr.push(age1822);
    }

    if (filterObj.age2330) {
      start = this.getTimeFromYear(23);
      end = this.getTimeFromYear(30);
      const age2330 = this.getFilteredData(query.where('dob', '>=', end).where('dob', '<=', start));
      promiseArr.push(age2330);
    }

    if (filterObj.age3140) {
      start = this.getTimeFromYear(31);
      end = this.getTimeFromYear(40);
      const age3140 = this.getFilteredData(query.where('dob', '>=', end).where('dob', '<=', start));
      promiseArr.push(age3140);
    }

    if (filterObj.age40) {
      start = this.getTimeFromYear(41);
      end = this.getTimeFromYear(90);
      const age40 = this.getFilteredData(query.where('dob', '>=', end).where('dob', '<=', start));
      promiseArr.push(age40);
    }

    if (filterObj.male) {
      type.push('male');
    } else if (filterObj.female) {
      type.push('female');
    } else if (filterObj.all) {
      type = ['male', 'female'];
    }

    if (!promiseArr.length && type.length) {
      this.getFilteredData(query.where('gender', 'in', type), true);
      return;
    } else if (type.length) {
      Promise.all(promiseArr).then(_ => {
        if (this.state.memberList.length) {
          this.combinedOfflineFilter(type);
        } else {
          this.getFilteredData(query.where('gender', 'in', type), true);
        }
      });
      return;
    }

    if (promiseArr.length) {
      Promise.all(promiseArr).then(_ => {
        this.setState({
          isLoading: false
        });
      });
    }
  }

  combinedOfflineFilter(type: string | any[]) {
    let arr = [...this.state.memberList];

    arr = arr.filter(obj => {
      return type.indexOf(obj.gender) > -1;
    });

    this.setState({
      memberList: [...arr],
      isLoading: false
    });
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
            {this.state.showFilterModal === true &&
              <FilterModal show={filterObj} onFilterSelect={this.onFilterSelect}></FilterModal>
            }
            {this.state.memberList.length > 0 &&
              <FlatList
                contentContainerStyle={styles.listContainer}
                data={this.state.memberList}
                keyExtractor={(index) => index.mobile}
                renderItem={({ item }) =>
                  <TouchableOpacity style={styles.item}
                    onPress={() => this.onMemberClick(item)} >
                    <View style={styles.listItemWrapper}>
                      <View style={styles.listItem}>
                        <Image source={(item.image && item.image !== '') ?
                          { uri: item.image } : (item.gender === 'male' ? boyImg: girlImg)}
                          style={styles.profileImg} />
                        <View style={{ paddingLeft: 40 }}>
                          <Text style={styles.nameText}>
                            {item.name}
                          </Text>
                          <View style={styles.listDesc}>
                            <Text style={{ textTransform: 'capitalize', color: '#000' }}>
                              City: {item.city}
                            </Text>
                            {item.dob != null && typeof (item.dob) === 'number' &&
                              <View style={{ flexDirection: 'row' }}>
                                <Text>,</Text>
                                <Text style={{ paddingHorizontal: 5, color: '#000' }}>
                                  Age: {this.getAge(item.dob)}
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
            }
            {!this.state.memberList.length &&
              <Text style={styles.noMember}>No member found.</Text>
            }
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
    fontWeight: 'bold',
    fontFamily: 'serif'
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
  },
  noMember: {
    fontSize: 26,
    color: '#000',
    margin: 30,
    textAlign: 'center'
  }
});
