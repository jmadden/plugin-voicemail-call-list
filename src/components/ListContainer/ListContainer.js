import React from 'react';
import { connect } from 'react-redux';
import { ContentFragment, withTheme } from '@twilio/flex-ui';
import ReactAudioPlayer from 'react-audio-player';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import MaterialList from '@material-ui/core/List';
import MaterialListItem from '@material-ui/core/ListItem';
import MaterialListItemIcon from '@material-ui/core/ListItemIcon';
import MaterialListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import EqualizerIcon from '@material-ui/icons/Equalizer';

import { Container, List } from './ListContainer.Components';
import RecordingPlayer from '../RecordingPlayer/RecordingPlayer';
import ListItemContainer from '../ListItemContainer/ListItemContainer';
import RecordingService from '../../services/RecordingService';
import { formatSecondsToHHMMSS, formatTimestamp } from '../../helpers';

const styles = (theme) => ({
  root: {
    ...theme.TaskList.Item.Container,
    backgroundColor: '#dde4eb',
    '&:focus': {
      backgroundColor: `#dde4eb`
    },
    '&:hover': {
      backgroundColor: '#c8d3de'
    }
  },
  // focused: {
  //   backgroundColor: `${theme.TaskList.Item.Container.background} !important`
  // },
  selected: {
    ...theme.TaskList.Item.SelectedContainer,
    backgroundColor: `${theme.TaskList.Item.SelectedContainer.background} !important`
  },
});

class ListContainer extends React.PureComponent {
  initialState = {
    activeCallSid: '',
    activeRecording: {
      duration: null,
      sid: null,
      timestamp: null,
      url: null
    },
    activeRecordingIndex: 0,
  }

  state = {
    ...this.initialState
  }

  componentDidUpdate() {
    const { activeItem } = this.props;
    const { callSid, recordings } = activeItem;
    const { activeRecording } = this.state;

    let updatedState = {};

    if (!callSid) {
      updatedState = {
        ...this.initialState
      };
    }

    if (callSid && this.state.activeCallSid !== callSid) {
      updatedState = {
        ...this.initialState,
        activeCallSid: callSid
      }
    }

    if (recordings && activeRecording.sid === null) {
      updatedState.activeRecording = recordings[0];
      updatedState.activeRecordingIndex = 0;
    }

    if (Object.keys(updatedState).length > 0) {
      this.setState({ ...updatedState });
    }
  }

  handlePlayerOnEnded = (event) => {
    const { activeItem } = this.props;
    const recordings = activeItem.recordings || [];

    const nextRecordingIndex = this.state.activeRecordingIndex + 1;

    if (nextRecordingIndex < recordings.length) {
      this.setState({
        activeRecording: recordings[nextRecordingIndex],
        activeRecordingIndex: nextRecordingIndex,
      });
    }
  }

  handlePlaylistItemClick = (recording, index) => {
    console.debug('ListContainer, recording playlist item clicked.', recording);
    
    this.setState({
      activeRecording: recording,
      activeRecordingIndex: index,
    });
  }

  renderRecordingPlaylist = (recordings) => {
    const { classes } = this.props;

    return (
      <ContentFragment>
        <MaterialList
          disablePadding
        >
        { recordings.map((r, i) => (
          <MaterialListItem
            key={r.sid}
            button
            classes={classes}
            dense
            divider
            selected={r.sid === this.state.activeRecording.sid}
            onClick={() => { this.handlePlaylistItemClick(r, i); }}
          >
            <MaterialListItemIcon>
              <EqualizerIcon fontSize="small" />
            </MaterialListItemIcon>
            <MaterialListItemText>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px' }}>{formatTimestamp(r.timestamp)}</span>
                <span style={{ fontSize: '10px' }}>{formatSecondsToHHMMSS(r.duration)}</span>
              </div>
            </MaterialListItemText>
          </MaterialListItem>
        ))}
        </MaterialList>
        <Divider />
      </ContentFragment>
    )
  }

  render() {
    const {
      activeItem,
      itemList,
      itemType,
    } = this.props;

    const { recordings } = activeItem;
    const { activeRecording } = this.state;

    return (
      <Container>
        <div>
          <RecordingPlayer
            recordingSid={activeRecording && activeRecording.sid}
            onEnded={this.handlePlayerOnEnded}
          />
        </div>
        <List>
        {
          Array.isArray(recordings)
            && recordings.length > 1
            && this.renderRecordingPlaylist(recordings)
        }
        {
          itemList && Array.isArray(itemList) && itemList.length > 0
            ? itemList.map(i => <ListItemContainer 
                key={i.callSid}
                item={i}
                itemType={itemType} />
              )
            : null
        }
        </List>
      </Container>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { itemType } = props;
  const activeItem = itemType === 'voicemail'
    ? state.voicemail.list.activeItem
    : state.callHistory.list.activeItem;
  return {
    activeItem
  };
}

export default connect(mapStateToProps)(withTheme(withStyles(styles)(ListContainer)));
