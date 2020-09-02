import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  BackHandler,
} from 'react-native';
import firebase from 'firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HeaderBackButton } from '@react-navigation/stack';

const userImg = require("../images/boy.jpg");

export default class Chat extends Component {
  db: firebase.firestore.Firestore;

  constructor(props) {
    super(props);

    this.state = {
      isUserOnline: false,
      person: {
        from: this.props.route.params.from.mobile,
        to: this.props.route.params.user.mobile,
        user: this.props.route.params.user,
        loggedInMember: this.props.route.params.from,
      },
      textMessage: '',
      messageList: [],
    };

    this.db = firebase.firestore();
  }

  componentDidMount() {
    // BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    // this.props.navigation.setOptions({
    //   headerLeft: () => <HeaderBackButton tintColor="white" onPress={this.handleBackButton} />
    // });
  }

  handleBackButton = () => {
    console.log("Back = ");
    // this.props.navigation.navigate('HomeComp',
    //   {
    //     screen: 'Home',
    //     params: {
    //       fromChatPage: this.props.route.params.user.mobile
    //     }
    //   }
    // );

    // return true;
  }

  UNSAFE_componentWillMount() {
    let chatVal, isFromLoggedInUser;

    firebase
      .database()
      .ref('messages')
      .child(this.state.person.from)
      .child(this.state.person.to)
      .on('child_added', value => {
        chatVal = value.val();
        // console.log("Val = ", chatVal);

        isFromLoggedInUser = chatVal.from === this.state.person.from;

        if (this.state.isUserOnline && !isFromLoggedInUser
          && !chatVal.read) {
          this.setReadStatus(chatVal);
        }

        this.setState(prevState => {
          return {
            messageList: [...prevState.messageList, value.val()],
          };
        });
      });

    this.setUserOnlineStatus();
    this.updateOnlineStatus(true);
  }

  setUserOnlineStatus() {
    let onlineVal, showStatus: {} | null | undefined;

    firebase
      .database()
      .ref('recents')
      .child(this.state.person.to)
      .child(this.state.person.from)
      .on('value', value => {
        onlineVal = value.val() && value.val().online;
        this.setState({ isUserOnline: onlineVal });
        showStatus = onlineVal ? 'Online' : 'Offline';

        if (onlineVal) {
          this.setMsgRead();
        }

        this.props.navigation.setOptions({
          headerTitle: () => {
            return (
              <View style={{ marginLeft: -15 }}>
                <Text style={{ fontSize: 22, color: '#fff' }}>
                  {this.props.route.params.user.name}
                </Text>
                <Text style={{ color: '#fff' }}>{showStatus}</Text>
              </View>
            )
          }
        });
      });
  }

  async setMsgRead() {
    let msgListArr = [...this.state.messageList];
    const len = msgListArr.length;

    let ref = firebase.database().ref('recents/' + this.state.person.to + '/' + this.state.person.from);

    const message = await ref.once("value").then(function (snapshot) {
      return snapshot.val();
    });

    console.log("unreadArr = ",  this.state.person.to + '/' + this.state.person.from, message);

    const unreadArr = message ? message.unread : null;

    if (!unreadArr) return;
    const unreadArrLen = unreadArr.length;

    for (let i = 0; i < unreadArrLen; i++) {
      firebase
        .database()
        .ref('messages/' + this.state.person.from + '/' + this.state.person.to + '/' + unreadArr[i])
        .update({ read: true });

      for (let j = len - 1; j >= len - 40; j--) {
        if (msgListArr[j] &&
          msgListArr[j].key === unreadArr[i]) {
          msgListArr[j]['read'] = true;
          break;
        }
      }
    };

    this.setState({ messageList: msgListArr });
    ref.update({ unread: [] });
  }

  setReadStatus(msgObj: { [x: string]: boolean; key: string; }) {
    firebase
      .database()
      .ref('messages/' + this.state.person.from + '/' + this.state.person.to +
        '/' + msgObj.key)
      .update({ read: true });
  }

  componentWillUnmount() {
    this.updateOnlineStatus(false);

  //   this.props.navigation.navigate('HomeComp',
  //   {
  //     screen: 'Home',
  //     params: {
  //       fromLogin: false,
  //       fromChatPage: this.props.route.params.user.mobile
  //     }
  //   }
  // );
    // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleChange = key => val => {
    this.setState({ [key]: val });
  }

  convertTime = time => {
    let d = new Date(time);
    let c = new Date();
    let result = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':';
    result += (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    if (c.getDate() !== d.getDate()) {
      result = d.getDate() + '/' + (d.getMonth() + 1) + ' ' + result;
    }
    return result;
  }

  setChatListDb() {
    const batch = this.db.batch();

    const fromRef = this.db.collection("chat_list")
      .doc(this.state.person.from)
      .collection('members')
      .doc(this.state.person.user.mobile);

    batch.set(fromRef, this.state.person.user);

    const toRef = this.db.collection("chat_list")
      .doc(this.state.person.to)
      .collection('members')
      .doc(this.state.person.loggedInMember.mobile);

    batch.set(toRef, this.state.person.loggedInMember);

    // Commit the batch
    batch.commit().then(function () {
      console.log('Chat db updated');
    });

    if (this.props.route.params.isSubscribed) {
      this.updateChatCountInDb();
    }
  }

  updateChatCountInDb() {
    this.db.collection("subscription_list")
      .doc(this.state.person.loggedInMember.mobile)
      .update({
        remaining_chat: firebase.firestore.FieldValue.increment(-1)
      })
      .then(_ => {
        console.log('Decremented chat count');
      }).catch(error => {
        console.log('Error = ', error);
      });
  }

  updateOnlineStatus(status: boolean) {
    firebase
      .database()
      .ref('recents/' + this.state.person.from + '/' + this.state.person.to)
      .update({
        online: status
      });
  }

  async setUnreadCount(msgId: string | null) {
    let ref = firebase.database().ref('recents/' + this.state.person.to + '/' + this.state.person.from);

    let message = await ref.once("value").then(function (snapshot) {
      return snapshot.val();
    });

    let unreadArr = message && message.unread ? message.unread : [];
    unreadArr.push(msgId);

    message = message || {};
    message['unread'] = unreadArr;

    ref.set(message);
  }

  sendMessage = async () => {
    if (this.state.textMessage.length) {
      if (!this.state.messageList.length) {
        this.setChatListDb();
      }

      let msgId = firebase
        .database()
        .ref('messages')
        .child(this.state.person.from)
        .child(this.state.person.to)
        .push().key;

      if (!this.state.isUserOnline) {
        this.setUnreadCount(msgId);
      }

      let updates = {};
      let message = {
        message: this.state.textMessage,
        time: firebase.database.ServerValue.TIMESTAMP,
        from: this.state.person.from,
        read: this.state.isUserOnline,
        key: msgId
      };

      updates[
        'messages/' + this.state.person.from + '/' + this.state.person.to + '/' + msgId
      ] = message;

      updates[
        'messages/' + this.state.person.to + '/' + this.state.person.from + '/' + msgId
      ] = message;

      firebase
        .database()
        .ref()
        .update(updates);

      this.setState({ textMessage: '' });
    }
  }

  isSenderSame = (currentMessage, prevMessage) => {
    return prevMessage && (currentMessage.from === prevMessage.from);
  }

  renderRow = ({ item, index }) => {
    const isSenderSame = this.isSenderSame(item, this.state.messageList[index - 1]);
    const isFromLoggedInUser = item.from === this.state.person.from;
    const img = isFromLoggedInUser ? this.state.person.loggedInMember.image :
      this.state.person.user.image;

    return (
      <View
        style={{
          flexDirection: 'column',
          maxWidth: '85%',
          minWidth: 100,
          alignSelf: isFromLoggedInUser ? 'flex-end' : 'flex-start',
          marginBottom: 5
        }}>
        {!isSenderSame &&
          <Image source={img ? { uri: img } : userImg}
            style={[styles.profileImg,
            { alignSelf: isFromLoggedInUser ? 'flex-end' : 'flex-start' }]} />
        }

        <View style={[styles.testWrapper,
        {
          backgroundColor: isFromLoggedInUser ? '#00A398' : '#7cb342'
        }]}>
          <Text style={[styles.textItem, {
            paddingRight: isFromLoggedInUser ? 35 : 0,
            paddingLeft: !isFromLoggedInUser ? 35 : 0
          }]}>
            {item.message}
          </Text>
          <View style={{
            flexDirection: 'row', marginTop: 0,
            alignSelf: isFromLoggedInUser ? 'flex-end' : 'flex-start'
          }}>
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {this.convertTime(item.time)}
            </Text>
            {isFromLoggedInUser &&
              <MaterialCommunityIcons name="check-all" size={14}
                style={{ marginLeft: 5 }}
                color={item.read ? "blue" : "white"} />
            }
          </View>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{ display: "flex", flexDirection: 'column', height: '100%' }}>
        <FlatList
          extraData={this.state.messageList}
          contentContainerStyle={{ paddingVertical: 10 }}
          style={{ paddingHorizontal: 10 }}
          data={this.state.messageList}
          initialNumToRender={10}
          ref={ref => this.flatList = ref}
          onContentSizeChange={() => this.flatList.scrollToEnd({ animated: true })}
          onLayout={() => this.flatList.scrollToEnd({ animated: true })}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => index.toString()}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 5,
            display: 'flex'
          }}>
          <TextInput
            style={styles.input}
            value={this.state.textMessage}
            placeholder="Type your message here..."
            onChangeText={this.handleChange('textMessage')}
          />
          <TouchableOpacity
            onPress={this.sendMessage}
            style={{ paddingBottom: 10, marginLeft: 5 }}>
            <Image
              source={require('../images/send-button.png')}
              style={{ width: 32, height: 32, marginRight: 5, marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#cccc',
    marginBottom: 10,
    borderRadius: 5,
    color: '#000000',
    flex: 1
  },
  profileImg: {
    width: 30,
    height: 30,
    borderRadius: 30,
    margin: 5
  },
  testWrapper: {
    marginHorizontal: 10,
    borderRadius: 5,
    padding: 5
  },
  textItem: {
    color: '#fff',
    fontSize: 16
  }
});
