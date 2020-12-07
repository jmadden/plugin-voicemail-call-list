import React from 'react';
import {
  ContentFragment,
  IconButton
} from '@twilio/flex-ui';

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import CheckCircleTwoToneIcon from '@material-ui/icons/CheckCircleTwoTone';
import CancelTwoToneIcon from '@material-ui/icons/CancelTwoTone';

import { isVoicemailItem } from '../../helpers';

const buttonStyle = {
  height: "24px",
  width: "24px"
};

class ListItemButtons extends React.PureComponent {
  state = {
    showConfirmDeleteButtons: false
  }

  onDeleteClick = () => {
    this.setState({ showConfirmDeleteButtons: true })
    this.props.toggleConfirmDeleteMessage();
  }

  onConfirmDeleteClick = () => {
    const {
      handleDeleteClicked,
      toggleConfirmDeleteMessage
    } = this.props;

    this.setState({ showConfirmDeleteButtons: false })
    toggleConfirmDeleteMessage();
    handleDeleteClicked();
  }

  onCancelDeleteClick = () => {
    this.setState({ showConfirmDeleteButtons: false })
    this.props.toggleConfirmDeleteMessage();
  }

  renderDeleteButton = () => {
    return (
      <IconButton
        icon={
          <DeleteIcon
            style={{ color: "crimson" }}
            fontSize="default"
          />
        }
        style={buttonStyle}
        onClick={this.onDeleteClick}
        title="Delete Recording"
      />
    )
  }

  renderPlayButton = () => {
    return (
      <IconButton
        icon={
          <PlayArrowIcon
            style={{ color: "royalblue" }}
            fontSize="default"
          />
        }
        style={buttonStyle}
        onClick={this.props.handlePlayClicked}
        title="Play Recording"
      />
    );
  }

  renderCopyButton = () => {
    return (
      <IconButton
        icon={
          <FileCopyOutlinedIcon
            fontSize="small"
            style={{ color: "DimGrey" }}
          />
        }
        style={buttonStyle}
        onClick={this.props.handleCopyClicked}
        title="Copy Recording Path"
      />
    );
  }

  renderButtons = () => {
    const { itemType } = this.props;

    return (
      <ContentFragment>
        {this.renderCopyButton()}
        {this.renderPlayButton()}
        {isVoicemailItem(itemType) && this.renderDeleteButton()}
      </ContentFragment>
    );
  }

  renderConfirmDeleteButtons = () => {
    return (
      <ContentFragment>
        <IconButton
          icon={<CheckCircleTwoToneIcon
            style={{ color: "forestgreen" }}
            fontSize="default"
          />}
          onClick={this.onConfirmDeleteClick}
          title="Confirm Delete"
        />
        <IconButton
          icon={<CancelTwoToneIcon
            style={{ color: "crimson" }}
            fontSize="default"
          />}
          onClick={this.onCancelDeleteClick}
          title="Cancel Delete"
        />
      </ContentFragment>
    )
  }

  render() {
    return (
      this.state.showConfirmDeleteButtons
        ? this.renderConfirmDeleteButtons()
        : this.renderButtons()
    )
  }
}

export default ListItemButtons;
