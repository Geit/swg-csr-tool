import { EuiBeacon } from '@elastic/eui';
import { css } from '@emotion/react';
import React from 'react';

interface PlayerOnlineBeaconProps {
  session?: {
    id: string;
    currentState: string;
    startedTime: string;
  } | null;
}

const loggedInBeaconStyles = css`
  display: inline-block;
  position: relative;
  width: 100%;
`;

/**
 * Renders a simple value, or a loading state.
 */
const PlayerOnlineBeacon: React.FC<PlayerOnlineBeaconProps> = ({ session }) => {
  if (!session || session.currentState !== 'Playing') return null;

  const formattedStartTime = new Date(session.startedTime).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'long',
  });

  return <EuiBeacon title={`Online since ${formattedStartTime}`} css={loggedInBeaconStyles} />;
};

export default PlayerOnlineBeacon;
