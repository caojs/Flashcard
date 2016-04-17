import _ from 'lodash';
import React from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    Component,
    TouchableOpacity,
    StatusBar,
    View,
    ScrollView,
    Text,
    Animated,
    Dimensions,
    StyleSheet
} from 'react-native';

import CardViewer from './CardViewer.js';

var DELTA = 10;
var pages = ['About', 'Blog', 'Contact', 'Home'];

function delta(index) {
    var temp = 1;
    return _.range(0, index).reduce((memo, index) => {
      memo += temp;
      temp = temp * 3/4;
      return memo;
    }, 0);
}

export default class MenuWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = this._state(props);
        this._frame = this._calculateFrame(this.state);
        this._initHandlers();
    }

    _state ({ length = 4, current = 3 }) {
        var frame = new Animated.Value(0);
        var state = {
            ...Dimensions.get('window'),
            frame: new Animated.Value(0),
            animations: this._initAnimations(length, 0),
            active: false,
            length,
            current,
        };
        return state;
    }

    _initAnimations (length, frame) {
      return _.range(0, length).map(index => ({
        translate: new Animated.ValueXY(),
        scale: new Animated.Value(1)
      }));
    }

    _initHandlers () {
        this.state.frame.addListener(({ value }) => this._startAnimation(value))
        this.state.frame.setValue(0);
        this._toggle = this._toggle.bind(this);
        this._tapPage = this._tapPage.bind(this);
    }

    _offset (state) {
        var { current, width } = state;
        var y = -delta(current)* DELTA/2;
        var x = width/2 + y;
        return {
            x,
            y,
            current,
            width
        };
    }

    _startAnimation (frame) {
      var animate = this._animate(frame);
      if (frame == 1) {
        animate = Animated.sequence([ animate, this._animate(2, 350) ]);
      }
      return animate.start(({ finished }) => {
          if (!finished) return;
          if (frame == 1) this.state.frame.setValue(2);
          if (frame == 3) this.state.frame.setValue(0);
      });
    }

    _tapMenu (index) {
      var { current } = this.state;
      if (index != current ) {
        this.state.current = index;
        this._frame = this._calculateFrame(this.state);
        this.state.frame.setValue(2);
      }
    }

    _tapPage () {
        var active = this.state.active;
        if (active) {
          this._toggle();
        }
    }

    _toggle () {
        var active = !this.state.active;
        this.setState({ active }, () => this.state.frame.setValue(active ? 1 : 3))
    }

    _zero ({ x, y , current, width}) {
        return (index) => ({
            x: index <= current ? (index == current ? 0 : x) : width,
            y: index == current ?  0 : y,
            scale: index == current ? 1 : 0.8,
            notAnimate: current != index
        });
    }

    _one ({ x, y, current, width }) {
        return (index) => ({
            x: index <= current ? x : width,
            y: y,
            scale: 0.8,
            notAnimate: current != index
        });
    }

    _two ({ x, y, current, width }) {
        return (index) => {
            var alpha = delta(current - index) *DELTA;
            return {
                x: index <= current ? x - alpha : width,
                y: y + alpha,
                scale: 0.8
            };
        };
    }

    _three ({ x, y, current, width }) {
        return (index) => {
            var alpha = delta(current - index) *DELTA;
            return {
                x: index <= current ? (index == current ? 0 : x - alpha) : width,
                y: index == current ? 0 : y + alpha,
                scale: index == current ? 1 : 0.8,
                notAnimate: index != current
            };
        };
    }

    _calculateFrame (state) {
      var { length } = state;
      var flow = [
        this._zero,
        this._one,
        this._two,
        this._three
      ].map((fn) => _.flow(this._offset, fn)(state));
      return _.range(0, length).map(index => flow.map(fn => fn(index)))
    }

    _animate (frame, duration = 300) {
      var { animations } = this.state;
      return Animated.parallel(animations.reduce((memo, { translate, scale }, index) => {
        var { x, y, scale: s, notAnimate } = this._frame[index][frame];
        if (notAnimate) {
          translate.setValue({ x, y });
          scale.setValue(s);
        }
        else {
          memo = memo.concat(
            Animated.timing(translate, {
              toValue: {
                x,
                y
              },
              duration
            }),
            Animated.timing(scale, {
              toValue: s,
              duration
            })
          )
        }
        return memo;
      }, []));
    }

    render () {
        var {
            length,
            active,
            animations
        } = this.state;

        return (
            <View style={styles.app}>
                <StatusBar barStyle="default"/>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.menu}
                        onPress={this._toggle}>
                        <Icon name="navicon" size={25} color="#DA344D"/>
                    </TouchableOpacity>
                    <Text style={styles.title}> Flashcard </Text>
                </View>
                <View style={styles.inner}>
                    <View style={[styles.navigation]}>
                        {[].slice.call(pages)
                            .reverse()
                            .map((page, index) => (
                                <TouchableOpacity
                                    style={styles.navItem}
                                    key={index}
                                    onPress={() => this._tapMenu(length - 1 - index)}>
                                    <Text style={styles.navItemText}>{page}</Text>
                                </TouchableOpacity>))}
                    </View>
                    {pages.map((page, index) => {
                        let state = animations[index];
                        let transform = [].concat(
                                state.translate.getTranslateTransform(),
                                {scale: state.scale});

                        return (
                            <Animated.View
                                key={index}
                                style={[styles.animatedView, {transform: transform}]}>
                                <CardViewer/>
                            </Animated.View>
                        )
                    })}

                </View>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    app: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    header: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        height: 65,
        backgroundColor: 'white'
    },
    menu: {
        position: 'absolute',
        top: 30,
        left: 10,
        width: 30,
        height: 25,
        alignItems: 'center',
        overflow: 'hidden',
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        color: '#DA344D'
    },
    inner: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    navigation: {
        marginLeft: 35
    },
    navItem: {
        paddingBottom: 15,
        paddingTop: 15
    },
    navItemText: {
        color: '#DA344D'
    },
    animatedView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: -5, height: 5},
        backgroundColor: '#DA344D'
    },
    touchablePage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
});
