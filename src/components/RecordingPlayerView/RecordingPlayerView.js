import React from 'react';
import { Actions, withTheme } from '@twilio/flex-ui';
import ReactAudioPlayer from 'react-audio-player';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import { Container, Title } from './RecordingPlayerView.Components';
import RecordingPlayer from '../RecordingPlayer/RecordingPlayer';
import { FlexViews } from '../../enums';

const styles = (theme) => ({
  root: {
    '& label': {
      marginLeft: '5px'
    },
    '& #recording-search-helper-text': {
      margin: '2px 5px 10px 5px'
    }
  },
});

class RecordingPlayerView extends React.PureComponent {
  state = {
    recordings: [],
    activeRecordingIndex: null,
    activeRecordingSid: null,
    searchText: ''
  }
  componentDidMount() {
    const params = new URLSearchParams(window.location.search);

    const updatedState = {};

    const recordings = params.get('recordings');

    if (recordings) {
      const recordingList = recordings.split(',');
      updatedState.recordings = recordingList;
      updatedState.activeRecordingIndex = 0;
      updatedState.activeRecordingSid = recordingList[0];
    }

    if (Object.keys(updatedState).length > 0) {
      this.setState(updatedState);
    }
  }

  extractRecordingSids = (searchString) => {
    const normalizedString = searchString.toUpperCase().replace(/\s/, '');

    const recordings = normalizedString.match(/(RE[a-zA-z\d]{32})/g);
    console.debug('Matched recordings:', recordings);

    return recordings;
  }

  handleSearchChange = (e) => {
    this.setState({ searchText: e.target.value });
  }

  handleSearchKeyPress = (e) => {
    if (e.keyCode !== 13 /* Enter key */) {
      return;
    }

    const recordings = this.extractRecordingSids(this.state.searchText);

    if (Array.isArray(recordings) && recordings.length > 0)  {
      this.setState({
        recordings,
        activeRecordingIndex: 0,
        activeRecordingSid: recordings[0]
      });
      Actions.invokeAction('HistoryPush', `/${FlexViews.recordingPlayer}/?recordings=${recordings.join(',')}`);
    }
  }

  handlePlayerOnEnded = () => {
    const { activeRecordingIndex, recordings } = this.state;

    const nextRecordingIndex = activeRecordingIndex + 1;

    if (nextRecordingIndex < recordings.length) {
      this.setState({
        activeRecordingSid: recordings[nextRecordingIndex],
        activeRecordingIndex: nextRecordingIndex,
      });

    } else {
      this.setState({
        activeRecordingSid: null,
        activeRecordingIndex: null,
        recordings: []
      });
    }
  }

  render() {
    const { classes } = this.props;
    const { activeRecordingSid, searchText } = this.state;

    return (
      <Container>
        <Title>Recording Player</Title>
        <TextField
          classes={classes}
          id="recording-search"
          label="Recording ID or URL"
          type="text"
          value={searchText}
          helperText="Enter the ID or URL of the recording you'd like to play"
          onChange={this.handleSearchChange}
          onKeyDown={this.handleSearchKeyPress}
        />
        <RecordingPlayer
          recordingSid={activeRecordingSid}
          onEnded={this.handlePlayerOnEnded}
        />
      </Container>
    );
  }
}

export default withTheme(withStyles(styles)(RecordingPlayerView));
