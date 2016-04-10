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
import MiniViewer from './app/components/MiniViewer.js';

class Flashcard extends Component {
    render(): ReactElement {
        return (
                <MenuWrapper/>
           )        
    }
}

AppRegistry.registerComponent('Flashcard', () => Flashcard);
