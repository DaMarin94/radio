import { registerRootComponent } from "expo";
import TrackPlayer from "react-native-track-player";

import App from "./App";
import { PlaybackService } from "./src/lib/audio";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);

// Register the track-player background service. This must run at the top level
// (outside of any component) so the OS can wake it for lock-screen / background
// controls. The actual implementation lives in src/lib/audio.ts.
TrackPlayer.registerPlaybackService(() => PlaybackService);
