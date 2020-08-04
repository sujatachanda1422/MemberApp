import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import firebase from '../database/firebase';

const image = require("../images/bkg.jpg");

export default class Signup extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      email: '',
      password: '',
      isLoading: false
    }
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  registerUser = () => {
    if (this.state.email === '' && this.state.password === '') {
      Alert.alert('Enter details to signup!')
    } else {
      this.setState({
        isLoading: true
      });

      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((res) => {
          res.user.updateProfile({
            name: this.state.name
          });

          console.log('User registered successfully!', res);

          this.setState({
            isLoading: false,
            name: '',
            email: '',
            password: ''
          });

          this.props.navigation.navigate('Login');
        })
        .catch(error => {
          console.log('Register error = ', error);
          this.setState({ errorMessage: error.message });
        });
    }
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
              placeholder="Name"
              value={this.state.name}
              onChangeText={(val) => this.updateInputVal(val, 'name')}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Email"
              value={this.state.email}
              onChangeText={(val) => this.updateInputVal(val, 'email')}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Password"
              value={this.state.password}
              onChangeText={(val) => this.updateInputVal(val, 'password')}
              maxLength={15}
              secureTextEntry={true}
            />
            <Button
              color="#3740FE"
              title="Signup"
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