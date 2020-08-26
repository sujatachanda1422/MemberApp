import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { Entypo } from '@expo/vector-icons';

export default class Profile extends Component {
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      modalVisible: true,
      age1822: false,
      age2330: false,
      age3140: false,
      age40: false,
      male: false,
      female: false,
      all: false,
      isClear: false,
      search: false,
      close: false
    };
  }

  UNSAFE_componentWillMount() {
    console.log("Mount", this.props.show);
    this.setState({ ...this.props.show, modalVisible: true });
  }

  hideModal(type: string) {
    const obj = type === 'clear' ?
      {
        age1822: false,
        age2330: false,
        age3140: false,
        age40: false,
        male: false,
        female: false,
        all: false
      } : this.state;

    const newObj = {
      ...obj,
      modalVisible: false,
      isClear: type === 'clear',
      search: type === 'filter',
      close: type === 'close'
    }

    this.setState(newObj);

    console.log("new", newObj);

    this.props.onFilterSelect(newObj);
  }

  render() {
    const { modalVisible } = this.state;

    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
        >
          <View
            style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.clearBtn}
                onPress={() => this.hideModal('close')}>
                <Entypo name="cross" size={32} color="black" />
              </TouchableOpacity>
              <View>
                <View style={{ margin: 20 }}>
                  <Text style={styles.header}>Filter By Age: </Text>
                </View>
                <View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.item} onPress={() => {
                      this.setState({ age1822: !this.state.age1822 });
                    }}>
                      <Text style={styles.text}>18-22</Text>
                      <Checkbox status={this.state.age1822 ? 'checked' : 'unchecked'}

                      />
                    </TouchableOpacity >
                    <TouchableOpacity style={styles.item} onPress={() => {
                      this.setState({ age2330: !this.state.age2330 });
                    }}>
                      <Text style={styles.text}>23-30</Text>
                      <Checkbox status={this.state.age2330 ? 'checked' : 'unchecked'}

                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <TouchableOpacity style={styles.item} onPress={() => {
                      this.setState({ age3140: !this.state.age3140 });
                    }}>
                      <Text style={styles.text}>31-40</Text>
                      <Checkbox status={this.state.age3140 ? 'checked' : 'unchecked'}

                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item} onPress={() => {
                      this.setState({ age40: !this.state.age40 });
                    }}>
                      <Text style={styles.text}>> 40</Text>
                      <Checkbox status={this.state.age40 ? 'checked' : 'unchecked'}

                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={{ marginTop: 20 }}>
                <View style={{ margin: 20 }}>
                  <Text style={styles.header}>Filter By Interest: </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity style={styles.item} onPress={() => {
                    this.setState({ male: !this.state.male });
                  }}>
                    <Text style={styles.text}>Male</Text>
                    <Checkbox status={this.state.male ? 'checked' : 'unchecked'}

                    />
                  </TouchableOpacity >
                  <TouchableOpacity style={styles.item} onPress={() => {
                    this.setState({ female: !this.state.female });
                  }}>
                    <Text style={styles.text}>Female</Text>
                    <Checkbox status={this.state.female ? 'checked' : 'unchecked'}

                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.item} onPress={() => {
                    this.setState({ all: !this.state.all });
                  }}>
                    <Text style={styles.text}>All</Text>
                    <Checkbox status={this.state.all ? 'checked' : 'unchecked'}

                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: 'row', marginTop: 25 }}>
                <TouchableOpacity onPress={() => this.hideModal('clear')}>
                  <Text style={[styles.button]}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.hideModal('filter')}>
                  <Text style={[styles.button, { color: '#2756ab' }]}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dcdcdc80'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    position: 'relative',
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  item: {
    flexDirection: 'row',
    marginRight: 20
  },
  text: {
    fontSize: 22,
    lineHeight: 35,
    color: '#000'
  },
  header: {
    color: '#2756ab',
    fontSize: 26,
    borderBottomColor: '#dcdcdc',
    borderBottomWidth: 1,
    alignSelf: 'center',
  },
  button: {
    fontSize: 24,
    margin: 20
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    top: 10
  }
});