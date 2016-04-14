import React, {
    Component,
    View,
    Image,
    Dimensions,
    StyleSheet
} from 'react-native';

import Throwable from './Throwable.js';

export default class CardViewer extends Component {
    constructor (props) {
        super(props);
        this.imgs = ['http://fakeimg.pl/350x200/', 'http://fakeimg.pl/250x100/fff0d0/'];
    }

    render () {
        return (
            <View style={styles.viewer}>
                {this.imgs.map((url, index) => (
                    <Throwable
                        key={index}
                        style={styles.throw}
                        throwed={() => console.log('throwed')}
                        throwedLeft={() => console.log('lef')}
                        throwedRight={() => console.log('right')}>
                        <Image source={{uri: url}} style={[styles.img]}/>
                    </Throwable>)) }
            </View>
        )
    }
}

var styles = StyleSheet.create({
    viewer: {
        flex: 1
    },
    throw: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    img: {
        flex: 1,
        resizeMode: 'contain'
    }
});

