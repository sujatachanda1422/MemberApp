import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Alert
} from 'react-native';
import firebase from '../database/firebase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CryptoJS from "react-native-crypto-js";

export default class ChangePin extends Component {
  db: firebase.firestore.Firestore;

  constructor() {
    super();

    this.state = {
      loginPin: null,
      loginPinVerify: null
    };

    this.db = firebase.firestore();
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  verifyPin() {
    if (!(/^\d{4}$/).test(this.state.loginPin) ||
      !(/^\d{4}$/).test(this.state.loginPinVerify)) {
      Alert.alert('', 'Please provide a valid pin');
      return false;
    }

    if (this.state.loginPin === this.state.loginPinVerify) {
      return true;
    } else {
      Alert.alert('', 'Verify pin does not match. Try again.');
      return false;
    }
  }

  getConfirmation() {
    if (!this.verifyPin()) {
      return;
    }

    Alert.alert('', 'Are you sure, you want to change your login pin?',
      [
        {
          text: 'Cancel'
        },
        {
          text: 'Yes',
          onPress: () => this.changePin()
        }
      ]);
  }

  changePin() {
    const user = this.props.route.params.user;

    // Encrypt
    const encryptedPwd = CryptoJS.AES.encrypt(this.state.loginPin, 'chunchun').toString();

    this.db.collection("member_list")
      .doc(user.mobile).update({
        loginPin: encryptedPwd
      }).then(_ => {
        Alert.alert('', 'Your pin has been changed successfully', [
          {
            text: 'OK',
            onPress: () =>
              this.props.navigation.navigate('HomeComp',
                {
                  screen: 'Home',
                  params: {
                    fromLogin: false,
                    user
                  }
                }
              )
          }]
        )
      })
      .catch(error => {
        console.log('Pin error = ', error);
      });
  }

  render() {
    return (
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} >
        <View style={styles.container}>
          <TextInput
            style={styles.inputStyle}
            placeholder="Create new login pin (4 digits)"
            keyboardType='numeric'
            value={this.state.loginPin}
            secureTextEntry={true}
            maxLength={4}
            onChangeText={(val) => this.updateInputVal(val, 'loginPin')}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder="Re-enter login pin"
            keyboardType='numeric'
            value={this.state.loginPinVerify}
            secureTextEntry={true}
            maxLength={4}
            onChangeText={(val) => this.updateInputVal(val, 'loginPinVerify')}
          />
          <Button
            color="#3740FE"
            title="Change Pin"
            onPress={() => this.getConfirmation()}
          />
        </View>
      </KeyboardAwareScrollView >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: '#aac8dc',
    padding: 20
  },
  inputStyle: {
    width: '100%',
    marginBottom: 25,
    padding: 10,
    alignSelf: "center",
    backgroundColor: '#fff',
    borderRadius: 2
  },
});