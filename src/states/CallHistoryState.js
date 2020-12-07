import { combineReducers } from 'redux';

const ACTION_TOGGLE_CALL_HISTORY = 'TOGGLE_CALL_HISTORY';
const ACTION_CLOSE_CALL_HISTORY = 'CALL_HISTORY';
const ACTION_SET_ACTIVE_ITEM = 'SET_ACTIVE_CALL_HISTORY_ITEM';
const ACTION_CLEAR_ACTIVE_ITEM = 'CLEAR_ACTIVE_CALL_HISTORY_ITEM';
const ACTION_UPDATE_CALL_HISTORY_CALLS = 'UPDATE_CALL_HISTORY_CALLS';

const initialState = {
  isOpen: false
};

export const namespace = 'callHistory'

export class Actions {
  static toggleCallHistory = () => ({ type: ACTION_TOGGLE_CALL_HISTORY });

  static closeCallHistory = () => ({ type: ACTION_CLOSE_CALL_HISTORY });

  static setActiveItem = (item) => ({ type: ACTION_SET_ACTIVE_ITEM, item });

  static clearActiveItem = () => ({ type: ACTION_CLEAR_ACTIVE_ITEM });

  static updateCallHistory = (calls) => (
    { type: ACTION_UPDATE_CALL_HISTORY_CALLS, calls }
  ) ;
}

function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_TOGGLE_CALL_HISTORY: {
      return {
        ...state,
        isOpen: !state.isOpen
      }
    }
    case ACTION_CLOSE_CALL_HISTORY: {
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
    case ACTION_UPDATE_CALL_HISTORY_CALLS: {
      return {
        ...state,
        calls: action.calls
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
