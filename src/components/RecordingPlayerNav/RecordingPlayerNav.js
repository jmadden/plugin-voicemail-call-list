import React from 'react';
import * as Flex from '@twilio/flex-ui';

import { FlexViews } from '../../enums';

class RecordingPlayerNav extends React.PureComponent {
  render() {
    const { activeView } = this.props;
    return (
      <Flex.SideLink
        showLabel={true}
        icon="Volume"
        iconActive="VolumeBold"
        isActive={activeView === FlexViews.recordingPlayer}
        onClick={() => { Flex.Actions.invokeAction('HistoryPush', `/${FlexViews.recordingPlayer}`); }}
      >
        Recording Player
      </Flex.SideLink>
    );
  }
}

export default RecordingPlayerNav;
