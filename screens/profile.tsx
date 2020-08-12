import React, { Component } from 'react';
import { StyleSheet, View, TextInput, Button, ActivityIndicator } from 'react-native';
import firebase from '../database/firebase';
import AsyncStorage from '@react-native-community/async-storage';

export default class Profile extends Component {
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

  async updateUser() {
    

    // return;

    this.setState({
      isLoading: true
    });

    this.db.collection("member_list").doc(this.state.mobile).set(this.state)
      .then(_ => {
        this.setState({
          isLoading: false
        });

        this.props.navigation.navigate('Home', { user: this.state });

        this.setState({
          name: '',
          mobile: '',
          gender: 'male',
          city: '',
          dob: '',
          pin: ''
        });
      })
      .catch(error => {
        console.log('Register error = ', error);
        this.setState({ errorMessage: error.message });
      });
  }

  UNSAFE_componentWillMount() {
    this.setState(this.props.route.params.user);
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
        <View style={styles.overlay}>
          <TextInput
            style={[styles.inputStyle, { backgroundColor: '#dcdcdc' }]}
            placeholder="Mobile"
            editable={false}
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
          <Button
            color="#3740FE"
            title="Update"
            onPress={() => this.updateUser()}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: '#aac8dc'
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