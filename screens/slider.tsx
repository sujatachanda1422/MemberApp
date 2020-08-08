import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
const window = Dimensions.get('window');

interface SliderProps {
    style: object,
    onPackageChange: any
}

export default class CardSilder extends Component<SliderProps> {
    canAutoMove: boolean;
    slider: any;

    constructor(props: SliderProps) {
        super(props);
        this.state = {
            numOfCards: this.props.children.length
        }
        this.scroll = this.scroll.bind(this);
        this.canAutoMove = true;
    }

    scroll(e) {
        this.canAutoMove = false;
        let offsetX = e.contentOffset.x;
        const page = parseInt(offsetX / (window.width - 30));

        this.props.onPackageChange(page);

        setTimeout(() => {
            this.canAutoMove = true;
        }, 1000);
    }
    render() {
        let cards;
        if (this.props.children.length > 1) {
            cards = this.props.children.map((item, ii) => {
                return (
                    <View style={styles.card} key={ii}>
                        {item}
                    </View>
                )
            })
        } else {
            cards = <View style={styles.card}>
                {this.props.children}
            </View>
        }
        return (
            <ScrollView
                {...this.props}
                ref={slider => this.slider = slider}
                style={[styles.scroll, this.props.style]}
                onScroll={e => this.scroll(e.nativeEvent)}
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={20}
            >
                {cards}
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        width: window.width - 30,
        marginHorizontal: 15,
        overflow: 'visible',
    },
    card: {
        width: window.width - 40,
        marginHorizontal: 5,
    }
});