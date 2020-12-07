import React from 'react';
import { withTheme } from '@twilio/flex-ui';
import {
  Container,
  StyledSidePanel
} from './SidePanelContainer.Components';
import ListContainer from '../ListContainer/ListContainer';

const SidePanelContainer = (props) => {
  const { handleClose, itemList, itemType, theme, title } = props;
  return (
    <Container>
      <StyledSidePanel
        displayName="Custom"
        themeOverride={theme && theme.OutboundDialerPanel}
        handleCloseClick={handleClose}
        title={title}
      >
        <ListContainer
          itemList={itemList}
          itemType={itemType}
        />
      </StyledSidePanel>
    </Container>
  )
}

export default withTheme(SidePanelContainer);
