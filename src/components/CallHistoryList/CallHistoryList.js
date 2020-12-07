import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import SidePanelContainer from '../SidePanelContainer/SidePanelContainer';
import { Actions as CallHistoryActions } from '../../states/CallHistoryState';

class CallHistoryList extends React.PureComponent {
  handleCloseButton = () => {
    const { clearActiveItem, closeCallHistory } = this.props;
    closeCallHistory();
    console.debug('Clearing active call history item');
    clearActiveItem();
  }

  sortCalls = (calls) => {
    // Using slice() to avoid mutating the original array
    return calls.slice().sort((c1, c2) => {
      const c1Timestamp = new Date(c1.timestamp);
      const c2Timestamp = new Date(c2.timestamp);

      return c2Timestamp - c1Timestamp;
    })
  } 

  render() {
    const { isOpen, calls } = this.props;

    const sortedCalls = this.sortCalls(calls);

    return isOpen ? (
      <SidePanelContainer
        handleClose={this.handleCloseButton}
        title="Call History"
        itemList={sortedCalls}
        itemType="callHistory"
      >
        Call History List Container
      </SidePanelContainer>
    ) : null
  }
}

const mapStateToProps = (state) => {
  const { isOpen, calls } = state.callHistory.list;
  return {
    calls: Array.isArray(calls) ? calls : [],
    isOpen
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeCallHistory: bindActionCreators(CallHistoryActions.closeCallHistory, dispatch),
    clearActiveItem: bindActionCreators(CallHistoryActions.clearActiveItem, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CallHistoryList);
