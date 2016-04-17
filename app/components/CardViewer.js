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
        this.state = {
            imgs: ['http://fakeimg.pl/350x200/', 'http://fakeimg.pl/250x100/fff0d0/']
        };
    } 
    
    render () {
        var { imgs } = this.state;

        return (
            <View style={styles.viewer}>
                {imgs.map((url, index) => (
                    <Throwable
                        key={index}
                        style={styles.throw}
                        throwed={() => this._throwed(index)}>
                        <Image source={{uri: url}} style={[styles.img]}/>
                    </Throwable>))}
            </View>
        )
    }

    _throwed (index) {
        this.setState({
            imgs: this.state.imgs.slice(0, index)
        });
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

