import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import copy from 'copy-to-clipboard';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { capitalizeFirstLetter } from '../../helpers';

import {
  ActionsContainer,
  Container,
  Content,
  FirstLineContainer,
  SecondLineContainer,
  UpperArea
} from './ListItemContainer.Components';
import ListItemButtons from '../ListItemButtons/ListItemButtons';
import { Actions as VoicemailActions } from '../../states/VoicemailListState';
import { Actions as CallHistoryActions } from '../../states/CallHistoryState';
import VoicemailListSync from '../../sync/VoicemailListSync';
import RecordingService from '../../services/RecordingService';
import FlexState from '../../states/FlexState';
import { formatSecondsToHHMMSS, formatTimestamp, isVoicemailItem } from '../../helpers';
import { FlexViews } from '../../enums';

const styleNewMessageContainer = {
  borderLeft: '6px solid crimson'
};

const styleNewMessageContent = {
  marginLeft: '-6px'
};

class ListItemContainer extends React.PureComponent {
  state = {
    showConfirmDeleteMessage: false,
    isCopyNoticeOpen: false
  }

  handlePlayClicked = () => {
    const { item, itemType, setActiveItem } = this.props;
    
    setActiveItem(item);

    if (isVoicemailItem(itemType)) {
      VoicemailListSync.incrementMessagePlayCount(item);
    }
  }

  handleDeleteClicked = async () => {
    const {
      clearActiveItem,
      isActive,
      item,
      itemType
    } = this.props;

    if (isActive) {
      clearActiveItem()
    }

    if (isVoicemailItem(itemType)) {
      console.debug('Deleting message');
      const { recordingSid } = item;

      VoicemailListSync.deleteMessage(item);
      await RecordingService.deleteRecording(recordingSid);
    }
  }

  handleCopyClicked = () => {
    const { item } = this.props;
    const recordings = (item && item.recordings) || [];

    if (recordings.length === 0) {
      return;
    }

    const recordingSids = recordings.map(r => r.sid).join(',');
    let baseFlexUrl;
    if (window.location.origin.includes('localhost')) {
      baseFlexUrl = window.location.origin;
    } else {
      baseFlexUrl = `${window.location.origin}/${FlexState.serviceBaseUrl}`;
    }
    const recordingPlayerView = `${baseFlexUrl}/${FlexViews.recordingPlayer}`;
    const recordingLink = `${recordingPlayerView}/?recordings=${recordingSids}`;

    console.debug('Copying link for recordings', recordingLink);
    copy(recordingLink);
    this.setState({ isCopyNoticeOpen: true });
  }

  handleCopyNoticeClose = () => {
    this.setState({ isCopyNoticeOpen: false })
  }

  toggleConfirmDeleteMessage = () => {
    this.setState({ showConfirmDeleteMessage: !this.state.showConfirmDeleteMessage })
  }

  render() {
    const { isActive, item, itemType } = this.props;
    const {
      name,
      number,
      timestamp,
      direction,
      duration,
      playCount
    } = item;
    
    const isNewMessage = isVoicemailItem(itemType) && playCount === 0;

    const firstLineText = this.state.showConfirmDeleteMessage
      ? 'Delete voicemail message?'
      : `${number}` + (name && name !== number ? ` (${name})` : '');

    const formattedTimestamp = formatTimestamp(timestamp);
    
    const formattedDuration = formatSecondsToHHMMSS(duration);

    return (
      <Container
        className="Twilio-TaskListBaseItem"
        isActive={isActive}
        onDoubleClick={this.handlePlayClicked}
        style={isNewMessage ? styleNewMessageContainer : {}}
      >
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          open={this.state.isCopyNoticeOpen}
          autoHideDuration={3000}
          onClose={this.handleCopyNoticeClose}
          message="Recording link copied"
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleCopyNoticeClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
        <UpperArea
          className="Twilio-TaskListBaseItem-UpperArea"
        >
          {/* <IconAreaContainer className="Twilio-TaskListBaseItem-IconAreaContainer">
            <ListIcon
              className="Twilio-TaskListBaseItem-IconArea"
            />
          </IconAreaContainer> */}
          <Content
            className="Twilio-TaskListBaseItem-Content"
            style={isNewMessage ? styleNewMessageContent : {}}
          >
            <FirstLineContainer className="Twilio-TaskListBaseItem-FirstLine">
              {`${firstLineText}`}
            </FirstLineContainer>
            <SecondLineContainer className="Twilio-TaskListBaseItem-SecondLine">
              <div>{formattedTimestamp}</div>
              { direction
                ? <div>{capitalizeFirstLetter(direction)}</div>
                : null
              }
              <div>{formattedDuration}</div>
            </SecondLineContainer>
          </Content>
          <ActionsContainer className="Twilio-TaskListBaseItem-Actions">
            <ListItemButtons
              itemType={itemType}
              handlePlayClicked={this.handlePlayClicked}
              handleDeleteClicked={this.handleDeleteClicked}
              handleCopyClicked={this.handleCopyClicked}
              toggleConfirmDeleteMessage={this.toggleConfirmDeleteMessage}
            />
          </ActionsContainer>
        </UpperArea>
      </Container>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { item, itemType } = props;
  const activeItem = itemType === 'voicemail'
    ? state.voicemail.list.activeItem
    : state.callHistory.list.activeItem

  const isActive = activeItem && item
    ? activeItem.callSid === item.callSid
    : undefined;

  return {
    isActive
  }
}

const mapDispatchToProps = (dispatch, props) => {
  const { itemType } = props;
  const setActiveItem = itemType === 'voicemail'
    ? bindActionCreators(VoicemailActions.setActiveItem, dispatch)
    : bindActionCreators(CallHistoryActions.setActiveItem, dispatch);

  const clearActiveItem = itemType === 'voicemail'
    ? bindActionCreators(VoicemailActions.clearActiveItem, dispatch)
    : bindActionCreators(CallHistoryActions.clearActiveItem, dispatch);

  return {
    clearActiveItem,
    setActiveItem
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ListItemContainer);
