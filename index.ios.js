/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
    AppRegistry,
    Component,
}
from 'react-native';
import App from './app/index.js';
import MenuWrapper from './app/components/MenuWrapper.js';
import Menu2 from './app/components/MenuWrapper_.js'

class Flashcard extends Component {
    render() {
        return (
                <Menu2/>
           )
    }
}

AppRegistry.registerComponent('Flashcard', () => Flashcard);
