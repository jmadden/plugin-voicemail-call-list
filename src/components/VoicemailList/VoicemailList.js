import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import SidePanelContainer from '../SidePanelContainer/SidePanelContainer';
import { Actions as VoicemailActions } from '../../states/VoicemailListState';

class VoicemailList extends React.PureComponent {
  handleCloseButton = () => {
    const { clearActiveItem, closeVoicemailList } = this.props;
    closeVoicemailList();
    console.debug('Clearing active voicemail item');
    clearActiveItem();
  }

  sortMessages = (messages) => {
    // Using slice() to avoid mutating the original array
    return messages.slice().sort((m1, m2) => {
      const m1PlayCountSort = m1.playCount > 0 ? 1 : 0;
      const m2PlayCountSort = m2.playCount > 0 ? 1 : 0;

      const m1Timestamp = new Date(m1.timestamp);
      const m2Timestamp = new Date(m2.timestamp);

      return m1PlayCountSort - m2PlayCountSort || m2Timestamp - m1Timestamp;
    })
  } 

  render() {
    const { isOpen, messages } = this.props;

    const sortedMessage = this.sortMessages(messages);
    
    return isOpen ? (
      <SidePanelContainer
        handleClose={this.handleCloseButton}
        title="Voicemail"
        itemList={sortedMessage}
        itemType="voicemail"
      >
        Voicemail List Container
      </SidePanelContainer>
    ) : null
  }
}

const mapStateToProps = (state) => {
  const { isOpen, messages } = state.voicemail.list;

  return {
    isOpen,
    messages: Array.isArray(messages) ? messages : []
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeVoicemailList: bindActionCreators(VoicemailActions.closeVoicemailList, dispatch),
    clearActiveItem: bindActionCreators(VoicemailActions.clearActiveItem, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VoicemailList);
