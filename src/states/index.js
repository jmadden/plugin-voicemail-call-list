import { combineReducers } from 'redux';

import { reduce as CustomTaskListReducer } from './CustomTaskListState';
import VoicemailListReducer from './VoicemailListState';
import CallHistoryReducer from './CallHistoryState';

// Register your redux store under a unique namespace
export const namespaceVoicemail = 'voicemail';
export const namespaceCallHistory = 'callHistory'

// Combine the reducers
export default combineReducers({
  customTaskList: CustomTaskListReducer,
  callHistory: CallHistoryReducer,
  voicemailList: VoicemailListReducer
});
