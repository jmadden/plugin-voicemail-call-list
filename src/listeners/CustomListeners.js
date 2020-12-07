import { Actions, Manager } from '@twilio/flex-ui';

import FlexState from '../states/FlexState';
import { Actions as VoicemailActions } from '../states/VoicemailListState';
import { Actions as CallHistoryActions } from '../states/CallHistoryState';
import VoicemailListSync from '../sync/VoicemailListSync';
import CallHistorySync from '../sync/CallHistorySync';

const manager = Manager.getInstance();

manager.events.addListener('pluginsLoaded', () => {
  VoicemailListSync.initialize();
  CallHistorySync.initialize();
});

Actions.addListener('afterToggleOutboundDialer', () => {
  const state = Manager.getInstance().store.getState();

  const { callHistory, flex, voicemail } = state;
  const { view: { isOutboundDialerOpen }} = flex;

  if (isOutboundDialerOpen && callHistory.list.isOpen) {
    const payload = CallHistoryActions.closeCallHistory();
    FlexState.dispatchStoreAction(payload);
  }

  if (isOutboundDialerOpen && voicemail.list.isOpen) {
    const payload = VoicemailActions.closeVoicemailList();
    FlexState.dispatchStoreAction(payload);
  }
})
