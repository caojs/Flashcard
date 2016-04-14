import { clamp } from 'lodash';
import React, {
    Component,
    View,
    Text,
    PanResponder,
    Animated,
    StyleSheet,
    PropTypes
} from 'react-native';

const SWIPE_THRESHOLD = 140;

export default class Throwable extends Component {
    constructor (props) {
        super(props);
        this.state = { pan: new Animated.ValueXY() };
    }

    componentWillMount () {
        var { x, y } = this.state;
        this._panHandlers = this._panResponder().panHandlers;
        if (this.props.observe) {
            this.props.observe(x, y);
        }
    }

    componentWillUnMount () {
        var { pan } = this.state;
        pan.x.removeAllListener();
        pan.y.removeAllListener();
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
            onMoveShouldSetPanResponder: (e, gestureState) => this._shouldMove(e, gestureState),
            onMoveShouldSetPanResponderCapture: (e, gestureState) => this._shouldMoveCapture(e, gestureState),
            onPanResponderGrant: () => this._panGrant(panX, panY),
            onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}]),
            onPanResponderRelease: (e, gestureState) => this._panRelease(panX, panY, gestureState)
        });
    }

    _shouldMove (e, gestureState) {
        if (this.props.onMoveShouldSetPanResponder) {
            return this.props.onMoveShouldSetPanResponder(e, gestureState);
        }
        return true;
    }

    _shouldMoveCapture (e, gestureState) {
        if (this.props.onMoveShouldSetPanResponderCapture) {
            return this.props.onMoveShouldSetPanResponderCapture(e, gestureState);
        }
        return true;
    }

    _panGrant (x, y) {
        var { pan } = this.state;
        pan.setOffset({ x, y });
        pan.setValue({ x: 0, y: 0 });
    }

    _clampVelocity (v) {
        var sign = v < 0 ? -1 : 1;
        return clamp(v*sign, 3.5, 5) * sign;
    }

    _panRelease (x, y, {vx, vy}) {
        var { pan } = this.state;
        pan.flattenOffset();

        if (Math.abs(x) > (this.props.threshold || SWIPE_THRESHOLD)) {
            let throwHandle = x < 0 ?
                this.props.throwedLeft :
                this.props.throwedRight;

            Animated
                .decay(pan, {
                    velocity: {x: this._clampVelocity(vx), y: vy},
                    deceleration: 0.98
                })
                .start(() => {
                    if (throwHandle) {
                        throwHandle();
                    }
                    if (this.props.throwed) {
                        this.props.throwed();
                    }
                });
        }
        else {
            Animated
                .spring(pan, {
                    toValue: {x: 0, y: 0}
                }).start(() => {
                    if (this.props.release) {
                        this.props.release();
                    }
                });
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
            this.props.style,
            {opacity},
            {transform: [{translateX}, {translateY}, {rotate}]}
        ];
    }
};

Throwable.propTypes = {
    threshold: PropTypes.number,
    style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    onMoveShouldSetPanResponder: PropTypes.func,
    onMoveShouldSetPanResponderCapture: PropTypes.func,
    observe: PropTypes.func,
    release: PropTypes.func,
    throwed: PropTypes.func,
    throwedLeft: PropTypes.func,
    throwedRight: PropTypes.func
};
