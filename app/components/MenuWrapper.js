import React, {
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
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';

var SIDE_NAV = '_SIDE_NAVE_';
var PAGE = '_PAGE_';
var DELTA = 10;
var pages = ['About', 'Blog', 'Contact', 'Home'];

function delta(index) {
    var temp = 1;
    var result = 0;

    for (var i = 0; i < index; i++) {
        result += temp;
        temp = temp * 3 / 4;
    }

    return result;
}

export default class MenuWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = this._state(pages);
        this._initHandlers();
    }

    _state (pages) {
        var animations = pages.reduce((memo, page, index) => {
                return memo.concat({
                    scale: new Animated.Value(1),
                    translate: new Animated.ValueXY()
                });
            }, []);

        return {
            ...Dimensions.get('window'),
            length: pages.length,
            current: 3, 
            active: false,
            animations,
        }
    }

    _initHandlers () {
        this._baseGenerate = this._chain('base', this._baseIte);
        this._sortGenerate = this._chain('sort', this._sortIte);
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
            ...state
        };
    }

    _sortIte ({ x, y, current, width }) {
        return (v, index) => {
            var alpha = delta(current - index) *DELTA;
            return {
                x: index <= current ? x - alpha : width,
                y: y + alpha
            };
        };
    }

    _baseIte ({ x, y, active, current, width }) {
        return (v, index) => ({
            x: index <= current ? (!active ? 0 : x) : width,
            y: !active ? 0 : y
        });
    }

    _chain (type, fn) {
        var log = (input) => (console.log(input), input);
        var map = (input) => input.animations.map(fn(input));

        return _.memoize(
                _.flow(this._offset, map, log),
                ({ current, width, active }) => type + current + active + width);
    }

    _open () {
        var {
            current,
            animations
        } = this.state;
        var step1Positions = this._baseGenerate(this.state);
        var step2Positions = this._sortGenerate(this.state);

        var step1 = step1Positions.reduce((memo, position, index) => {
            var state = animations[index];
            if (index === current) {
                memo.push(
                        Animated.timing(state.translate, { toValue: position, duration: 300 }),
                        Animated.timing(state.scale, { toValue: 0.8, duration: 300 })
                        );
            }
            else {
                state.translate.setValue(position);
                state.scale.setValue(0.8);
            }

            return memo;
        }, []);

        var step2 = animations.reduce((memo, state, index) => {
            memo.push(
                Animated.timing(state.translate, {
                    toValue: step2Positions[index],
                    duration: 300
                })
            );
            return memo;
        }, []);

        Animated.sequence([
            Animated.parallel(step1),
            Animated.parallel(step2)
        ])
        .start();
    }

    _close () {
        var {
            current,
            animations
        } = this.state;

        var positions = this._baseGenerate(this.state);
        var state = animations[current];
        Animated.parallel([
            Animated.timing(state.translate, {
                toValue: positions[current],
                duration: 300
            }),
            Animated.timing(state.scale, {
                toValue: 1,
                duration: 300
            })
        ]).start(function () {
            animations.forEach((state, index) => {
                state.translate.setValue(positions[index]);

            });
        })
    }

    _tapMenu (index) {
        this.setState({current: index}, () => {
            var positions = this._sortGenerate(this.state);
            Animated.parallel(positions.map((position, index) => {
                return Animated.timing(this.state.animations[index].translate, {
                    toValue: position

                });
            })).start();
        })
    }

    _tapPage () {
        var active = this.state.active;
        if (active) {
            this.setState({ active: false }, () => this._close());
        }
    }

    _toggle () {
        var active = !this.state.active;
        this.setState({ active }, () => {
            if (active) {
                return this._open();
            }
            this._close();
        });
    }

    render () {
        var {
           length,
           animations
        } = this.state;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content"/>
                <View style={styles.inner}>
                    <View style={[styles.nav]}>
                        {[].slice.call(pages)
                            .reverse()
                            .map((page, index) => (
                                <TouchableOpacity
                                    style={styles.navItem}
                                    key={index}
                                    onPress={() => this._tapMenu(length - 1 - index)}>
                                    <Text>{page}</Text>
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
                                <TouchableOpacity style={styles.view} onPress={this._tapPage}>
                                    <Text>{page}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )
                    })}
                </View>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.headerMenu}
                        onPress={this._toggle}>
                        <Icon name="navicon" size={25} color="white"/>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}> Flashcard </Text>
                </View>
                
            </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f7f7f7'
    },
    nav: {
        marginLeft: 35
    },
    navItem: {
        paddingBottom: 15,
        paddingTop: 15
    },
    animatedView: {
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white'
    },
    view: {
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        shadowColor: 'black',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: -5, height: 5}
    },
    inner: {
        position: 'absolute',
        top: 60,
        bottom: 0,
        right: 0,
        left: 0,
        overflow: 'hidden',
        justifyContent: 'center'
    },
    header: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        height: 65,
        borderTopWidth: 20,
        borderTopColor: '#DA344D',
        backgroundColor: '#DA344D'
    },
    headerMenu: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: 30,
        height: 25,
        alignItems: 'center',
        overflow: 'hidden',
    },
    headerTitle: {
        fontSize: 20,
        color: 'white'
    }
});
