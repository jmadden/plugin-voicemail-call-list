import React from 'react';
import ReactAudioPlayer from 'react-audio-player';
import LinearProgress from '@material-ui/core/LinearProgress';

import RecordingService from '../../services/RecordingService';

class RecordingPlayer extends React.PureComponent {
  state = {
    activeRecordingSid: null,
    loading: false,
    mediaUrl: null
  }

  componentDidUpdate() {
    const { recordingSid } = this.props;
    const { activeRecordingSid } = this.state;

    if (recordingSid && activeRecordingSid !== recordingSid) {
      this.setState({
        activeRecordingSid: recordingSid,
        loading: true
      });
      RecordingService.getMediaUrl(recordingSid)
        .then(url => this.setState({ mediaUrl: url }));
    }
  }

  handlePlayerCanPlay = () => {
    this.setState({ loading: false });
  }

  handlePlayerOnPlay = () => {
    this.setState({ loading: false });
  }

  handlePlayerOnEnded = () => {
    if (this.props.onEnded) {
      this.props.onEnded();
    }
  }

  render() {
    const { loading, mediaUrl } = this.state;

    return (
      <React.Fragment>
        <ReactAudioPlayer
          src={mediaUrl}
          autoPlay
          controls
          controlsList="nodownload"
          onCanPlay={this.handlePlayerCanPlay}
          onEnded={this.handlePlayerOnEnded}
          onPlay={this.handlePlayerOnPlay}
          style={{
            height: "44px",
            outline: "none",
            width: "100%",
          }}
        />
        { loading && <LinearProgress />}
      </React.Fragment>
    )
  }
}

export default RecordingPlayer;
