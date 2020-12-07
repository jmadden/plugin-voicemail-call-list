import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions, IconButton, withTheme } from '@twilio/flex-ui';
import HistoryIcon from '@material-ui/icons/History';

import { Actions as CallHistoryActions } from '../../states/CallHistoryState';
import { Actions as VoicemailActions } from '../../states/VoicemailListState';

class CallHistoryButton extends React.PureComponent {
  state = {
    iconColor: 'white'
  }

  toggleIconColor = () => {
    const iconColor = this.state.iconColor === 'white' ? 'red' : 'white';
    this.setState({ iconColor });
  }

  handleButtonClick = () => {
    const {
      clearActiveCallHistoryItem,
      clearActiveVoicemailItem,
      isOutboundDialerOpen,
      isVoicemailListOpen,
      toggleCallHistory,
      toggleVoicemailList
    } = this.props;

    if (isOutboundDialerOpen) {
      Actions.invokeAction('ToggleOutboundDialer');
    }

    if (isVoicemailListOpen) {
      clearActiveVoicemailItem()
      toggleVoicemailList();
    }

    clearActiveCallHistoryItem();
    toggleCallHistory();
  }

  render() {
    const { isOpen, theme } = this.props;
    const iconColor = isOpen ? 'red' : this.state.iconColor;
    return (
      <IconButton
        key="call-history-icon"
        icon={<HistoryIcon
          style={{ color: iconColor }}
          fontSize="small"
        />}
        themeOverride={theme.MainHeader.Button}
        title="Call History"
        onClick={this.handleButtonClick}
      >
        Call History
      </IconButton>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isOpen: state.callHistory.list.isOpen,
    isOutboundDialerOpen: state.flex.view.isOutboundDialerOpen,
    isVoicemailListOpen: state.voicemail.list.isOpen
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearActiveCallHistoryItem: bindActionCreators(CallHistoryActions.clearActiveItem, dispatch),
    clearActiveVoicemailItem: bindActionCreators(VoicemailActions.clearActiveItem, dispatch),
    toggleCallHistory: bindActionCreators(CallHistoryActions.toggleCallHistory, dispatch),
    toggleVoicemailList: bindActionCreators(VoicemailActions.toggleVoicemailList, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(CallHistoryButton));
