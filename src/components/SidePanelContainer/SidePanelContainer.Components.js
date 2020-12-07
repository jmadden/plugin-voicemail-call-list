import React from 'react';
import styled from 'react-emotion';
import { SidePanel } from '@twilio/flex-ui';

export const StyledSidePanel = styled(SidePanel)`
  height: 100%;
  width: 276px;
`;

export const Container = styled('div')`
  display: flex;
  position: absolute;
  height: 100%;
  right: 0px;
  z-index: 10;
`