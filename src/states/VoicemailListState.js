import { combineReducers } from 'redux';

const ACTION_TOGGLE_VOICEMAIL_LIST = 'TOGGLE_VOICEMAIL_LIST';
const ACTION_CLOSE_VOICEMAIL_LIST = 'CLOSE_VOICEMAIL_LIST';
const ACTION_SET_ACTIVE_ITEM = 'SET_ACTIVE_VOICEMAIL_ITEM';
const ACTION_CLEAR_ACTIVE_ITEM = 'CLEAR_ACTIVE_VOICEMAIL_ITEM';
const ACTION_UPDATE_VOICEMAIL_MESSAGES = 'UPDATE_VOICEMAIL_MESSAGES';

const initialState = {
  isOpen: false
};

export const namespace = 'voicemail'

export class Actions {
  static toggleVoicemailList = () => (
    { type: ACTION_TOGGLE_VOICEMAIL_LIST }
  );

  static closeVoicemailList = () => (
    { type: ACTION_CLOSE_VOICEMAIL_LIST }
  );

  static setActiveItem = (item) => (
    { type: ACTION_SET_ACTIVE_ITEM, item }
  );

  static clearActiveItem = () => (
    { type: ACTION_CLEAR_ACTIVE_ITEM }
  );

  static updateVoicemailMessages = (messages) => (
    { type: ACTION_UPDATE_VOICEMAIL_MESSAGES, messages }
  ) ;
}

function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_TOGGLE_VOICEMAIL_LIST: {
      return {
        ...state,
        isOpen: !state.isOpen
      }
    }
    case ACTION_CLOSE_VOICEMAIL_LIST: {
      return {
        ...state,
        isOpen: false
      }
    }
    case ACTION_SET_ACTIVE_ITEM: {
      return {
        ...state,
        activeItem: action.item
      }
    }
    case ACTION_CLEAR_ACTIVE_ITEM: {
      return {
        ...state,
        activeItem: {}
      }
    }
    case ACTION_UPDATE_VOICEMAIL_MESSAGES: {
      return {
        ...state,
        messages: action.messages
      }
    }
    default: {
      return state;
    }
  }
}

export default combineReducers({
  list: reduce
});
