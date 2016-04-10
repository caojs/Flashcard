import { clamp } from 'lodash';
import React, {
    Component,
    View,
    Text,
    PanResponder,
    Animated,
    StyleSheet
} from 'react-native';

const SWIPE_THRESHOLD = 160;

export default class MiniViewer extends Component {
    constructor (props) {
        super(props);
        this.state = { pan: new Animated.ValueXY() };
    }

    componentWillMount () {
        this._panHandlers = this._panResponder().panHandlers;
    }

    componentWillUnMount () {
        var { pan } = this.state;
        pan.x.removeAllListener();
        pan.y.removeAllListener();
    }

    _panResponder () {
        var {
            pan,
            rotate,
            opacity
        } = this.state;

        var panX = 0;
        var panY = 0;

        pan.x.addListener(({ value }) => panX = value)
        pan.y.addListener(({ value }) => panY = value)

        return PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: () => this._panGrant(panX, panY),
            onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}]),
            onPanResponderRelease: (e, gestureState) => this._panRelease(panX, panY, gestureState)
        });
    }

    _panGrant (x, y) {
        console.log('grant');
        var { pan } = this.state;
        pan.setOffset({ x, y });
        pan.setValue({ x: 0, y: 0 });
    }

    _clampVelocity (v) {
        if (v < 0) {
            v = v * -1;
        }
        return clamp(v, 3, 5);
    }

    _panRelease (x, y, {vx, vy}) {
        var { pan } = this.state;
        pan.flattenOffset();

        if (x > SWIPE_THRESHOLD) {
            Animated
                .decay(pan, {
                    velocity: {x: this._clampVelocity(vx), y: vy},
                    deceleration: 0.98
                })
                .start(() => {
                    console.log(pan.x, pan.y)
                });
        }
        else {
            Animated
                .spring(pan, {
                    toValue: { x: 0, y: 0}
                }).start();
        }
    } 

    _getStyle () {
        var { pan: {x, y} } = this.state;
        var [translateX, translateY] = [x, y];
        var rotate = x.interpolate({
            inputRange: [-200, 0, 200],
            outputRange: ['-20deg', '0deg', '20deg']
        });
        var opacity = x.interpolate({
            inputRange: [-200, 0, 200],
            outputRange: [ 0.5, 1, 0.5]
        });

        return [
            styles.box,
            {opacity},
            {transform: [{translateX}, {translateY}, {rotate}]}
        ];
    }

    render () {
        return (
            <Animated.View
                style={this._getStyle()}
                {...this._panHandlers}>
                {this.props.children}
            </Animated.View>
        )
    }
}

var styles = StyleSheet.create({
    box: {
        width: 200,
        height: 200,
        backgroundColor: 'red'
    }
})
