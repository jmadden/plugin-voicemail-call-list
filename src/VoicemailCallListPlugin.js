import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import voicemailReducers, { namespace as voicemailNamespace } from './states/VoicemailListState';
import callHistoryReducers, { namespace as callHistoryNamespace } from './states/CallHistoryState';

import VoicemailButton from './components/VoicemailButton/VoicemailButton';
import VoicemailList from './components/VoicemailList/VoicemailList';
import CallHistoryButton from './components/CallHistoryButton/CallHistoryButton';
import CallHistoryList from './components/CallHistoryList/CallHistoryList';
import RecordingPlayerView from './components/RecordingPlayerView/RecordingPlayerView';
import RecordingPlayerNav from './components/RecordingPlayerNav/RecordingPlayerNav';

import { FlexViews } from './enums';

import './listeners/CustomListeners';
import './styles/GlobalStyles';

const PLUGIN_NAME = 'VoicemailCallListPlugin';

export default class VoicemailCallListPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);

    flex.MainHeader.Content.add(
      <VoicemailButton key="voicemail-button" />,
      { sortOrder: 0, align: 'end' }
    );

    flex.MainContainer.Content.add(<VoicemailList key="voicemail-list" />);

    flex.MainHeader.Content.add(
      <CallHistoryButton key="call-history-button" />,
      { sortOrder: -1, align: 'end' }
    );

    flex.MainContainer.Content.add(<CallHistoryList key="call-history-list" />);

    //flex.ViewCollection.Content.add(<RecordingPlayerView key="recording-player-view" />);
    flex.ViewCollection.Content.add(
      <flex.View name={FlexViews.recordingPlayer} key="recording-player-key">
        <RecordingPlayerView />
      </flex.View>
    );

    //flex.SideNav.Content.add(<RecordingPlayerNav key="recording-player-nav" />);
    flex.SideNav.Content.add(<RecordingPlayerNav key="recording-player-nav" />)
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(voicemailNamespace, voicemailReducers);
    manager.store.addReducer(callHistoryNamespace, callHistoryReducers);
  }
}
