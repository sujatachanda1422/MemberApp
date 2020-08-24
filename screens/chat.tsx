import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import firebase from 'firebase';

const userImg = require("../images/user.jpg");

export default class Chat extends Component {
  db: firebase.firestore.Firestore;

  constructor(props) {
    super(props);

    this.state = {
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
    this.props.navigation.setOptions({
      title: this.props.route.params.user.name
    });

  }

  UNSAFE_componentWillMount() {
    firebase
      .database()
      .ref('messages')
      .child(this.state.person.from)
      .child(this.state.person.to)
      .on('child_added', value => {
        // console.log("Old chats == ", value.val());

        this.setState(prevState => {
          return {
            messageList: [...prevState.messageList, value.val()],
          };
        });
      });
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
    let batch = this.db.batch();

    let fromRef = this.db.collection("chat_list")
      .doc(this.state.person.from)
      .collection('members')
      .doc(this.state.person.user.mobile);

    batch.set(fromRef, this.state.person.user);

    let toRef = this.db.collection("chat_list")
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
      let updates = {};
      let message = {
        message: this.state.textMessage,
        time: firebase.database.ServerValue.TIMESTAMP,
        from: this.state.person.from,
        image: this.state.person.loggedInMember.image
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

    return (
      <View
        style={{
          flexDirection: 'column',
          maxWidth: '70%',
          minWidth: 100,
          alignSelf: isFromLoggedInUser ? 'flex-end' : 'flex-start',
          marginBottom: 5
        }}>
        {!isSenderSame &&
          <Image source={(item.image && item.image !== '') ? { uri: item.image } : userImg}
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
          <Text style={{
            color: '#e6e6e6', marginTop: 0, fontSize: 12,
            alignSelf: isFromLoggedInUser ? 'flex-end' : 'flex-start'
          }}>
            {this.convertTime(item.time)}
          </Text>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{ display: "flex", flexDirection: 'column', height: '100%' }}>
        <FlatList
          contentContainerStyle={{ paddingVertical: 10 }}
          style={{ paddingHorizontal: 10 }}
          data={this.state.messageList}
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
