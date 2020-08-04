import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Button, ActivityIndicator, ImageBackground } from 'react-native';
import firebase from '../database/firebase';

const image = require("../images/bkg.jpg");

export default class Signup extends Component {
  db: firebase.firestore.Firestore;

  constructor() {
    super();
    this.state = {
      name: '',
      mobile: '',
      gender: 'male',
      city: '',
      dob: '',
      pin: '',
      isLoading: false
    }

    this.db = firebase.firestore();
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  registerUser = () => {
    console.log('State = ', this.state);

    this.setState({
      isLoading: true
    });

    this.db.collection("new_member_list").doc(this.state.mobile).set(this.state)
      .then((docRef) => {
        console.log("Document written with ID: ", docRef);

        this.setState({
          isLoading: false,
          name: '',
          mobile: '',
          gender: 'male',
          city: '',
          dob: '',
          pin: ''
        });

        this.props.navigation.navigate('Login');
      })
      .catch(error => {
        console.log('Register error = ', error);
        this.setState({ errorMessage: error.message });
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
            <TextInput
              style={styles.inputStyle}
              placeholder="Mobile"
              value={this.state.mobile}
              onChangeText={(val) => this.updateInputVal(val, 'mobile')}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Full Name"
              value={this.state.name}
              onChangeText={(val) => this.updateInputVal(val, 'name')}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Date of Birth"
              value={this.state.dob}
              onChangeText={(val) => this.updateInputVal(val, 'dob')}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="City"
              value={this.state.city}
              onChangeText={(val) => this.updateInputVal(val, 'city')}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Create login pin (4 digits)"
              keyboardType='numeric'
              value={this.state.pin}
              secureTextEntry={true}
              onChangeText={(val) => this.updateInputVal(val, 'pin')}
            />
            <Button
              color="#3740FE"
              title="Sign Up"
              onPress={() => this.registerUser()}
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  overlay: {
    backgroundColor: 'rgba(199,199,199,0.3)',
    height: '100%',
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    flex: 1,
    justifyContent: "center"
  },
  inputStyle: {
    width: '100%',
    marginBottom: 25,
    padding: 10,
    alignSelf: "center",
    backgroundColor: '#fff',
    borderRadius: 2
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