import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import firebase from '../database/firebase';

const image = require("../images/sub.jpg");

export default class MySubscription extends Component {
  db: firebase.firestore.Firestore;

  constructor() {
    super();

    this.state = {
      expiry_date: null,
      status: null,
      remaining_chat: null,
      package_name: null,
      isLoading: false
    };

    this.db = firebase.firestore();
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  UNSAFE_componentWillMount() {
    this.checkForSubscription();
  }

  checkForSubscription() {
    this.setState({
      isLoading: true
    });

    this.db.collection("subscription_list")
      .doc(this.props.route.params.user.mobile)
      .get()
      .then((doc) => {
        this.setState({
          isLoading: false
        });

        if (doc.exists) {
          this.setState(doc.data());
        } else {
          this.setState({
            status: null
          });
        }
      })
      .catch(error => {
        console.log('Error = ', error);
      });
  }

  addPackage() {
    this.props.navigation.navigate('HomeComp',
      {
        screen: 'Subscription',
        params: {
          user: this.props.route.params.user
        }
      }
    );
  }

  formatDate(date: string) {
    return new Date(date).toDateString().slice(4);
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
          <View style={styles.itemContainer}>
            {this.state.status &&
              <View style={{ marginBottom: 30 }}>
                <View style={styles.item}>
                  <Text style={styles.lable}>Current Package </Text>
                  <Text style={styles.itemValue}>{this.state.package_name}</Text>
                </View>
                <View style={styles.item}>
                  <Text style={styles.lable}>Status </Text>
                  <Text style={styles.itemValue}>{this.state.status}</Text>
                </View>
                <View style={styles.item}>
                  <Text style={styles.lable}>Remaining Chats </Text>
                  <Text style={styles.itemValue}>{this.state.remaining_chat}</Text>
                </View>

                {this.state.expiry_date !== '' &&
                  <View style={styles.item}>
                    <Text style={styles.lable}>Expiry Date </Text>
                    <Text style={styles.itemValue}>{this.formatDate(this.state.expiry_date)}</Text>
                  </View>
                }
              </View>
            }

            {!this.state.status &&
              <View style={{ backgroundColor: '#fff', marginBottom: 30, padding: 20 }}>
                <Text style={{ fontSize: 24, textAlign: 'center', color: '#000' }}>
                  You don't have any current subscription yet. Please add to enjoy chatting.
                   </Text>
              </View>
            }

            <Button
              color="#3740FE"
              title="Add Subscription"
              onPress={() => this.addPackage()}
            />
          </View>
        </ImageBackground>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: "center"
  },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  itemContainer: {
    marginHorizontal: 20
  },
  lable: {
    fontSize: 20,
    color: '#000',
    width: 100,
    lineHeight: 30,
  },
  itemValue: {
    fontSize: 24,
    color: 'blue',
    marginLeft: 30,
    textTransform: 'capitalize'
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomColor: '#dcdcdc',
    borderBottomWidth: 1,
    alignItems: "center"
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