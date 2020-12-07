import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions, IconButton, withTheme } from '@twilio/flex-ui';
import VoicemailIcon from '@material-ui/icons/Voicemail';

//import VoicemailIcon from '../VoicemailIcon/VoicemailIcon';
import { Actions as VoicemailActions } from '../../states/VoicemailListState';
import { Actions as CallHistoryActions } from '../../states/CallHistoryState';

class VoicemailButton extends React.PureComponent {
  state = {
    iconColor: this.defaultIconColor
  }

  defaultIconColor = 'white';
  newMessagesIconColor = 'red';

  componentDidMount() {
    setInterval(() => {
      const { newMessageCount } = this.props;
      if (newMessageCount > 0) {
        this.toggleIconColor();
      } else {
        this.resetIconColor();
      }
    }, 1000);
  }

  resetIconColor = () => {
    if (this.state.iconColor !== this.defaultIconColor) {
      this.setState({ iconColor: this.defaultIconColor });
    }
  }

  toggleIconColor = () => {
    const iconColor = this.state.iconColor === this.defaultIconColor
      ? this.newMessagesIconColor : this.defaultIconColor;
    this.setState({ iconColor });
  }

  handleButtonClick = () => {
    const {
      clearActiveCallHistoryItem,
      clearActiveVoicemailItem,
      isCallHistoryOpen,
      isOutboundDialerOpen,
      toggleCallHistory,
      toggleVoicemailList
    } = this.props;

    if (isOutboundDialerOpen) {
      Actions.invokeAction('ToggleOutboundDialer');
    }

    if (isCallHistoryOpen) {
      clearActiveCallHistoryItem();
      toggleCallHistory();
    }

    clearActiveVoicemailItem();
    toggleVoicemailList();
  }

  render() {
    const { isOpen, theme } = this.props;
    const iconColor = isOpen ? 'red' : this.state.iconColor;
    return (
      <IconButton
        icon={<VoicemailIcon
          style={{ color: iconColor }}
          fontSize="small"
        />}
        themeOverride={theme.MainHeader.Button}
        title="Voicemail"
        onClick={this.handleButtonClick}
      >
        Voicemail
      </IconButton>
    )
  }
}

const mapStateToProps = (state) => {
  const { isOpen, messages } = state.voicemail.list;
  const newMessages = (messages && messages.filter(m => m.playCount === 0)) || [];
  return {
    isOpen,
    isCallHistoryOpen: state.callHistory.list.isOpen,
    isOutboundDialerOpen: state.flex.view.isOutboundDialerOpen,
    newMessageCount: newMessages.length
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(VoicemailButton));
