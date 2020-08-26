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
import { MaterialIcons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';

let cityList: firebase.firestore.DocumentData[] = [];
const userImg = require("../images/user.jpg");

export default class Profile extends Component {
  db: firebase.firestore.Firestore;
  date: Date;

  constructor() {
    super();

    this.state = {
      name: null,
      mobile: null,
      city: 'Kolkata',
      dob: null,
      gender: null,
      image: null,
      isLoading: false,
      showDatePicker: false,
      picUpload: false
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

  getConfirmation() {
    if (!this.state.name.trim() || !this.state.dob) {
      Alert.alert('', 'Please provide all the details');
      return;
    }

    Alert.alert('', 'Are you sure, you want to update your profile?',
      [
        {
          text: 'Cancel',
          onPress: () => {
            const oldImg = this.state.oldImage;
            console.log('Img = ', oldImg);
            this.setState({ image: oldImg })
          }
        },
        {
          text: 'OK',
          onPress: () => this.updateUser()
        }
      ]);
  }

  updateUser() {
    this.setState({
      isLoading: true
    });

    const newUserDetails = {
      mobile: this.state.mobile,
      city: this.state.city,
      name: this.state.name,
      dob: new Date(this.state.dob).getTime(),
      gender: this.state.gender,
      image: this.state.image
    };

    this.db.collection("member_list")
      .doc(this.state.mobile)
      .update(newUserDetails)
      .then(_ => {
        this.setState({
          isLoading: false
        });

        AsyncStorage.setItem('loggedInUser', JSON.stringify(newUserDetails));

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
    await this.getCityList();

    if (userDetails) {
      userDetails = JSON.parse(userDetails);

      this.setState({
        name: userDetails.name,
        mobile: userDetails.mobile,
        city: userDetails.city,
        dob: new Date(userDetails.dob).toLocaleDateString('en-US'),
        image: userDetails.image,
        oldImage: userDetails.image,
        gender: userDetails.gender,
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
      title: 'Select Profile Picture',
      noData: true,
      maxWidth: 500,
      maxHeight: 500,
      quality: 1,
      storageOptions: { privateDirectory: true }
    };

    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        this.setState({ picUpload: true });
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

          // console.log('Url', url);

          this.setState({ image: url, picUpload: false });
        }
        catch (err) {
          console.log("Img err ..........", err);
        }
      }
    });
  }

  async getCityList() {
    cityList = [];

    await this.db.collection("city_list").get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        cityList.push(doc.data());
      });
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
          <View style={styles.imgOverlay}>
            <TouchableOpacity style={{ width: 200, position: 'relative' }}
              onPress={() => this.pickImage()} >
              {this.state.picUpload === true &&
                <View style={styles.picLoader}>
                  <ActivityIndicator size="large" color="#dcdcdc" />
                </View>
              }
              <Image source={this.state.image ?
                { uri: this.state.image } : userImg}
                style={styles.profileImg} />
              <MaterialIcons name="add-a-photo" size={36} color="white" style={styles.icon}
              />
            </TouchableOpacity>
          </View>
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
          <RadioButton.Group onValueChange={value => this.updateInputVal(value, 'gender')}
            value={this.state.gender}>
            <View style={styles.radio}>
              <Text style={styles.radioText}>Gender: </Text>
              <RadioButton.Item label="Male" value="male" color='blue' style={styles.radioBtn} labelStyle={styles.radioBtnLbl} />
              <RadioButton.Item label="Female" value="female" color='blue' style={styles.radioBtn} labelStyle={styles.radioBtnLbl} />
            </View>
          </RadioButton.Group>

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
          <Picker
            selectedValue={this.state.city}
            style={styles.dropDown}
            onValueChange={(itemValue) => this.setState({ city: itemValue })}>
            {cityList.map(item => {
              return <Picker.Item key={item.name} label={item.name} value={item.name} />
            })}
          </Picker>

          <Button
            color="#3740FE"
            title="Update"
            onPress={() => this.getConfirmation()}
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: '#aac8dc',
    padding: 20
  },
  imgOverlay: {
    alignItems: 'center',
    marginVertical: 30
  },
  profileImg: {
    width: 200,
    height: 200,
    borderRadius: 200
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff'
  },
  radioText: {
    lineHeight: 30,
    fontSize: 14
  },
  radioBtn: {
    marginRight: 20,
  },
  radioBtnLbl: {
    fontSize: 14
  },
  icon: {
    position: 'absolute',
    right: 20,
    top: 10
  },
  image: {
    flex: 1,
    justifyContent: "center"
  },
  dropDown: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff'
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
  },
  picLoader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 200,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfdfd85',
    zIndex: 1
  }
});