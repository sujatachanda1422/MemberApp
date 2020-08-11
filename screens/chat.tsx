import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import firebase from 'firebase';

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
    console.log('State ', this.state);
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
    if (c.getDay() !== d.getDay()) {
      result = d.getDay() + ' ' + d.getMonth() + ' ' + result;
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
  };

  renderRow = ({ item }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          width: '70%',
          alignSelf: item.from === this.state.person.from ? 'flex-end' : 'flex-start',
          backgroundColor: item.from === this.state.person.from ? '#00A398' : '#7cb342',
          borderRadius: 10,
          marginBottom: 10,
        }}>
        <Text style={{ color: '#fff', padding: 7, fontSize: 16 }}>
          {item.message}
        </Text>
        <Text style={{ color: '#eee', padding: 3, fontSize: 12 }}>
          {this.convertTime(item.time)}
        </Text>
      </View>
    );
  };

  render() {
    return (
      <View style={{ display: "flex", flexDirection: 'column', height: '100%' }}>
        <ScrollView style={{ flex: 1 }}>
          <FlatList
            style={{ padding: 10 }}
            data={this.state.messageList}
            renderItem={this.renderRow}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
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
  }
});
