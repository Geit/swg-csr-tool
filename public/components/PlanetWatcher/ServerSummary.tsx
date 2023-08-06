import { EuiBadge, EuiCard, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText, useEuiTheme } from '@elastic/eui';
import React, { useContext, useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { useRaf, useThrottle, useThrottleFn, useUpdate, useInterval } from 'react-use';
import { css } from '@emotion/react';

import { PlanetWatcherContext } from './DataProvider';

interface ZoneHoverEvent extends Event {
  detail?: {
    serversUnderMouse: string[];
  };
}

const ObjectOnServerCount: React.FC<{ serverId: number }> = ({ serverId }) => {
  const [objectOnServerCountReal, setObjectOnServerCountReal] = useState(0);
  const objectOnServerCount = useRef(0);
  const data = useContext(PlanetWatcherContext);
  useInterval(() => {
    if (objectOnServerCountReal !== objectOnServerCount.current)
      setObjectOnServerCountReal(objectOnServerCount.current);
  }, 100);

  useEffect(() => {
    objectOnServerCount.current = 0;
    for (const obj of data.objects.values()) {
      if (obj.visible && obj.authoritativeServer === serverId) objectOnServerCount.current += 1;
    }

    const sub = data.objectUpdates.subscribe(update => {
      if (update.type === 'CREATED') {
        if (update.data.authoritativeServer === serverId) {
          objectOnServerCount.current += 1;
        }
      } else if (update.type === 'DELETED') {
        if (update.data.authoritativeServer === serverId) {
          objectOnServerCount.current -= 1;
        }
      } else if (update.type === 'UPDATED' && update.prevData) {
        if (update.prevData.authoritativeServer === serverId && update.data.authoritativeServer !== serverId) {
          objectOnServerCount.current -= 1;
        } else if (update.prevData.authoritativeServer !== serverId && update.data.authoritativeServer === serverId) {
          objectOnServerCount.current += 1;
        }
      }
    });

    return () => sub.unsubscribe();
  }, [data.objectUpdates, data.objects, serverId]);

  return <span>{objectOnServerCount.current.toLocaleString()}</span>;
};

const FrameTimeSparklines: React.FC<{ serverId: number }> = ({ serverId }) => {
  const [lastFrameTimes, setLastFrameTimes] = useState<number[]>([]);
  const data = useContext(PlanetWatcherContext);

  useEffect(() => {
    const sub = data.frameEndUpdates.subscribe(update => {
      if (update.data.serverId === serverId) {
        setLastFrameTimes(prev => [...prev, update.data.frameTime].slice(-50));
      }
    });

    return () => sub.unsubscribe();
  }, [data, serverId]);

  return (
    <Sparklines data={lastFrameTimes} limit={20} min={0} max={Math.max(200, ...lastFrameTimes)}>
      <SparklinesLine color="#1c8cdc" />
      <SparklinesSpots />
    </Sparklines>
  );
};

const FrameTime: React.FC<{ serverId: number }> = ({ serverId }) => {
  const [lastFrameTime, setLastFrameTime] = useState('--');
  const data = useContext(PlanetWatcherContext);

  useEffect(() => {
    const sub = data.frameEndUpdates.subscribe(update => {
      if (update.data.serverId === serverId) {
        setLastFrameTime(`${update.data.frameTime}ms`);
      }
    });

    return () => sub.unsubscribe();
  }, [data, serverId]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{lastFrameTime}</span>;
};

const ServerSummary: React.FC = () => {
  const { euiTheme } = useEuiTheme();
  const data = useContext(PlanetWatcherContext);
  const [, setUpdateCount] = useState(0);
  const [hoveredServers, setHoverServers] = useState(new Set());

  const serverSummaryCard = css`
    margin-bottom: ${euiTheme.base}px;

    :last-of-type {
      margin-bottom: 0;
    }
  `;

  useEffect(() => {
    const sub = data.gameServerUpdates.subscribe(() => {
      setUpdateCount(prev => prev + 1);
    });

    return () => sub.unsubscribe();
  }, [data]);

  useLayoutEffect(() => {
    const eventHandler = (evt: ZoneHoverEvent): any => {
      const serversUnderMouse = new Set(evt.detail?.serversUnderMouse ?? null);

      // Should probably check for equality to prevent rerender?
      setHoverServers(serversUnderMouse);
    };

    document.addEventListener('zoneHover', eventHandler);

    return () => {
      document.removeEventListener('zoneHover', eventHandler);
    };
  });

  return (
    <div>
      {Array.from(data.gameServerStatus).map(([id, gs]) => (
        <EuiCard
          key={id}
          layout="horizontal"
          titleSize="xs"
          paddingSize="s"
          css={serverSummaryCard}
          title={
            <>
              <EuiBadge
                className={hoveredServers.has(gs.serverId) ? 'serverBadge hoveredServerBadge' : 'serverBadge'}
                color={gs.color}
                style={{
                  marginRight: '0.7rem',
                  textShadow: hoveredServers.has(gs.serverId) ? 'text-shadow: 0 0 0.01px black;' : '',
                }}
                // We use a key here to make sure the hover pulse is synced across all
                // badges when hovering intersections.
                key={`server-count-${hoveredServers.size}`}
              >
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>#{String(gs.serverId).padStart(3, '0')}</span>
              </EuiBadge>
              {gs.hostName}
            </>
          }
          description={
            <EuiText size="xs">
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem grow={false}>
                  <dl className="serverSummaryStat">
                    <dt>PID</dt>
                    <dd>{gs.systemPid}</dd>
                  </dl>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <dl className="serverSummaryStat">
                    <dt>Objects</dt>
                    <dd>
                      <ObjectOnServerCount serverId={gs.serverId} />
                    </dd>
                  </dl>
                </EuiFlexItem>

                <EuiFlexItem grow={false}>
                  <dl className="serverSummaryStat">
                    <dt>Frame Time</dt>
                    <dd>
                      <FrameTime serverId={gs.serverId} />
                    </dd>
                  </dl>
                </EuiFlexItem>
                <EuiFlexItem grow>
                  <FrameTimeSparklines serverId={gs.serverId} />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiText>
          }
        />
      ))}
    </div>
  );
};

export default ServerSummary;
