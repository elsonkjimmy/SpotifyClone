/* eslint-env jest */
/**
 * Fichier de configuration de configuration Jest pour mocker les modules natifs.
 * Permet d'exécuter les tests unitaires et d'intégration sans l'environnement natif Android/iOS.
 */

// Mock de React Native Firebase
const mockFieldValue = {
  arrayUnion: jest.fn(val => val),
  arrayRemove: jest.fn(val => val),
};

const mockFirestoreInstance = {
  settings: jest.fn(),
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  add: jest.fn().mockResolvedValue({id: 'mock-doc-id'}),
  update: jest.fn().mockResolvedValue(true),
  get: jest.fn().mockResolvedValue({
    empty: false,
    docs: [
      {
        id: 'mock-playlist-id',
        data: () => ({
          nom: 'Ma Super Playlist',
          createur: 'Playlist • test-user-id',
          songIds: [],
          userId: 'test-user-id',
        }),
      },
    ],
  }),
  where: jest.fn().mockReturnThis(),
};

const mockFirestore = () => mockFirestoreInstance;
mockFirestore.FieldValue = mockFieldValue;

jest.mock('@react-native-firebase/firestore', () => mockFirestore);

jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    currentUser: {uid: 'test-user-id', email: 'test@example.com'},
    onAuthStateChanged: jest.fn(cb => {
      cb({uid: 'test-user-id', email: 'test@example.com'});
      return jest.fn();
    }),
  });
});

jest.mock('@react-native-firebase/app', () => {
  return {
    initializeApp: jest.fn(),
  };
});

// Mock de React Native Track Player
jest.mock('react-native-track-player', () => ({
  addEventListener: jest.fn(),
  registerPlaybackService: jest.fn(),
  setupPlayer: jest.fn().mockResolvedValue(true),
  updateOptions: jest.fn(),
  add: jest.fn().mockResolvedValue(true),
  remove: jest.fn().mockResolvedValue(true),
  skip: jest.fn().mockResolvedValue(true),
  play: jest.fn().mockResolvedValue(true),
  pause: jest.fn().mockResolvedValue(true),
  stop: jest.fn().mockResolvedValue(true),
  reset: jest.fn().mockResolvedValue(true),
  getPlaybackState: jest.fn().mockResolvedValue({state: 'idle'}),
  getActiveTrack: jest.fn().mockResolvedValue(null),
  getQueue: jest.fn().mockResolvedValue([]),
  getActiveTrackIndex: jest.fn().mockResolvedValue(0),
  usePlaybackState: jest.fn(() => ({state: 'idle'})),
  useActiveTrack: jest.fn(() => null),
  useProgress: jest.fn(() => ({position: 0, duration: 100})),
  Capability: {
    Play: 'play',
    Pause: 'pause',
    SkipToNext: 'skip-to-next',
    SkipToPrevious: 'skip-to-previous',
    SeekTo: 'seek-to',
    Stop: 'stop',
  },
  State: {
    None: 'none',
    Ready: 'ready',
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    Buffering: 'buffering',
    Loading: 'loading',
  },
  RepeatMode: {
    Off: 0,
    Track: 1,
    Queue: 2,
  },
  Event: {
    PlaybackState: 'playback-state',
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
    RemoteStop: 'remote-stop',
  },
}));

// Mock de Lucide React Native (remplace les icônes par des composants simples)
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const {View} = require('react-native');
  const dummyIcon = props => React.createElement(View, props);
  return {
    Play: dummyIcon,
    Pause: dummyIcon,
    SkipForward: dummyIcon,
    SkipBack: dummyIcon,
    Repeat: dummyIcon,
    Shuffle: dummyIcon,
    Share2: dummyIcon,
    Laptop2: dummyIcon,
    Download: dummyIcon,
    X: dummyIcon,
    ListMusic: dummyIcon,
    AlignLeft: dummyIcon,
    Plus: dummyIcon,
    Check: dummyIcon,
    Square: dummyIcon,
    ChevronLeft: dummyIcon,
    ChevronDown: dummyIcon,
    ChevronRight: dummyIcon,
    MoreHorizontal: dummyIcon,
    LogIn: dummyIcon,
    Search: dummyIcon,
    Heart: dummyIcon,
    ArrowUpDown: dummyIcon,
    MoreVertical: dummyIcon,
    ListPlus: dummyIcon,
    LogOut: dummyIcon,
    Music: dummyIcon,
    User: dummyIcon,
    ShieldCheck: dummyIcon,
    ShieldAlert: dummyIcon,
    HelpCircle: dummyIcon,
    Bell: dummyIcon,
    Compass: dummyIcon,
    Trash2: dummyIcon,
    Edit3: dummyIcon,
    Sliders: dummyIcon,
  };
});

// Mock de React Navigation
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({children}) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useFocusEffect: callback => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(callback, []);
    },
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    createBottomTabNavigator: jest.fn(() => ({
      Navigator: ({children}) =>
        React.createElement('Navigator', null, children),
      Screen: ({children}) => React.createElement('Screen', null, children),
    })),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: jest.fn(() => ({
      Navigator: ({children}) =>
        React.createElement('Navigator', null, children),
      Screen: ({children}) => React.createElement('Screen', null, children),
    })),
  };
});

// Mock de React Native Linear Gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock de React Native Screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock de React Native Document Picker et Image Picker
jest.mock('react-native-document-picker', () => ({
  pickSingle: jest.fn(),
  pick: jest.fn(),
  isCancel: jest.fn().mockReturnValue(false),
  types: {
    audio: 'audio',
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

// Mock de l'écran SplashScreen pour éviter les erreurs d'animation dans Jest
jest.mock('./src/screens/SplashScreen', () => {
  const React = require('react');
  const {View} = require('react-native');
  return () => React.createElement(View);
});

// Mock de ServiceTelechargement pour éviter les erreurs de modules non résolus dans Jest
jest.mock('./src/services/ServiceTelechargement', () => ({
  telechargerChanson: jest.fn().mockResolvedValue(undefined),
  supprimerChansonTelechargee: jest.fn().mockResolvedValue(undefined),
  estChansonTelechargee: jest.fn().mockReturnValue(false),
  activerModeHorsLigne: jest.fn(),
  obtenirModeHorsLigne: jest.fn().mockReturnValue(false),
  recupererTousLesTelechargements: jest.fn().mockReturnValue([]),
  recupererChansonsTelechargees: jest.fn().mockReturnValue([]),
}));

jest.mock(
  '@react-native-google-signin/google-signin',
  () => ({
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      getTokens: jest.fn().mockResolvedValue({idToken: 'test-id-token'}),
      signIn: jest.fn().mockResolvedValue({
        type: 'success',
        data: {idToken: 'test-id-token', user: {email: 'test@example.com'}},
      }),
    },
  }),
  {virtual: true},
);

jest.mock(
  'react-native-app-auth',
  () => ({
    authorize: jest.fn().mockResolvedValue({accessToken: 'test-access-token'}),
  }),
  {virtual: true},
);
