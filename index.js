/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import {ServiceDeLecture} from './src/services/playbackService';

AppRegistry.registerComponent(appName, () => App);

// Enregistrement du service de lecture requis par react-native-track-player
TrackPlayer.registerPlaybackService(() => ServiceDeLecture);
