import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  Image
} from 'react-native';
import firebase from '../database/firebase';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-community/picker';

export default class Profile extends Component {
  db: firebase.firestore.Firestore;
  date: Date;

  constructor() {
    super();

    this.state = {
      name: null,
      mobile: null,
      city: null,
      dob: null,
      image: null,
      isLoading: false,
      showDatePicker: false
    };

    const dateNow = new Date();
    this.date = new Date(dateNow.getFullYear() - 18, dateNow.getMonth(), dateNow.getDate());
    this.db = firebase.firestore();
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  updateUser() {
    if (!this.state.name.trim() || !this.state.dob || !this.state.city
      || !this.state.image) {
      Alert.alert('', 'Please provide all the details');
      return;
    }

    this.setState({
      isLoading: true
    });

    const { isLoading, showDatePicker, ...userDetails } = this.state;

    this.db.collection("member_list")
      .doc(userDetails.mobile)
      .update(userDetails)
      .then(_ => {
        this.setState({
          isLoading: false
        });

        AsyncStorage.setItem('loggedInUser', JSON.stringify(userDetails));

        this.props.navigation.navigate('HomeComp',
          {
            screen: 'Home',
            params: {
              user: this.state
            }
          }
        );
      })
      .catch(error => {
        this.setState({
          isLoading: false
        });
        console.log('Register error = ', error);
      });
  }

  async UNSAFE_componentWillMount() {
    this.setState({
      isLoading: true
    });

    let userDetails = await AsyncStorage.getItem('loggedInUser');

    if (userDetails) {
      userDetails = JSON.parse(userDetails);

      this.setState({
        name: userDetails.name,
        mobile: userDetails.mobile,
        city: userDetails.city,
        dob: userDetails.dob,
        image: userDetails.image,
        isLoading: false
      });
    }
  }

  setDob(date: Date | undefined) {
    if (!date) {
      return;
    }

    const dateNow = new Date(this.date).getTime();
    const selectedDate = new Date(date).getTime();

    if (selectedDate < dateNow) {
      this.setState({
        dob: new Date(date).toLocaleDateString('en-US'),
        showDatePicker: false
      });
    } else {
      Alert.alert('', 'Age needs to be 18 years+',
        [
          {
            text: 'OK',
            onPress: () => this.setState({
              showDatePicker: false
            })
          }
        ]);
    }
  }

  async pickImage() {
    const options = {
      title: 'Select Profile Picture'
    };

    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        try {
          const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function () {
              reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", response.uri, true);
            xhr.send(null);
          });

          const mimeString = response.uri
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];

          const storageRef = firebase.storage().ref();
          const imageRef = storageRef.child(`images/${this.state.mobile}.jpg`);
          const snapshot = await imageRef.put(blob, { contentType: mimeString });

          const url = await snapshot.ref.getDownloadURL();

          console.log('Url', url);

          this.setState({ image: url });
        }
        catch (err) {
          console.log("Img err ..........", err);
        }
      }
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
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} >
        <View style={styles.container}>
          <View style={styles.overlay}>
            <TextInput
              style={[styles.inputStyle, { backgroundColor: '#dcdcdc' }]}
              editable={false}
              value={this.state.mobile}
            />
            <TextInput
              style={styles.inputStyle}
              placeholder="Full Name"
              value={this.state.name}
              onChangeText={(val) => this.updateInputVal(val, 'name')}
            />
            <TouchableOpacity
              style={styles.inputStyle}
              onPress={() => this.setState({ showDatePicker: true })}
            >
              <Text>{this.state.dob ? this.state.dob : 'Date of Birth'}</Text>
            </TouchableOpacity>
            {this.state.showDatePicker &&
              <RNDateTimePicker
                value={new Date(this.state.dob)}
                onChange={(evt, date) => this.setDob(date)}
              />
            }
            <TextInput
              style={[styles.inputStyle, { marginBottom: 0 }]}
              placeholder="City"
              value={this.state.city}
              onChangeText={(val) => this.updateInputVal(val, 'city')}
            />
            <View style={{ marginBottom: 20 }}>
              {this.state.image &&
                <Image source={{ uri: this.state.image }}
                  style={{ marginVertical: 20, width: 200, height: 200 }} />
              }
              <Button title="Click to update the profile picture"
                onPress={() => this.pickImage()} />
            </View>
            <Button
              color="#3740FE"
              title="Update"
              onPress={() => this.updateUser()}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
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