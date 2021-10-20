import { EuiComboBox, EuiDualRange, EuiFieldNumber, EuiFormRow, EuiSpacer, EuiSwitch } from '@elastic/eui';
import React, { useContext, useEffect, useState } from 'react';

import { AiMovementType } from '../../types/AIMovementType';
import { typeTagToString } from '../../utils/typeTagToString';
import { isPresent } from '../../utils/utility-types';

import { PlanetWatcherContext } from './DataProvider';

const ObjectSummary: React.FC = () => {
  const data = useContext(PlanetWatcherContext);
  const [objectTypesAvailable, setObjectTypesAvailable] = useState(new Set<number>());
  const [serverIds, setAvailableServerIds] = useState(new Set<number>());

  useEffect(() => {
    for (const [, obj] of data.objects) {
      if (!objectTypesAvailable.has(obj.objectTypeTag)) {
        setObjectTypesAvailable(prev => new Set([...prev, obj.objectTypeTag]));
      }
    }

    const sub = data.objectUpdates.subscribe(obj => {
      if (!objectTypesAvailable.has(obj.data.objectTypeTag)) {
        setObjectTypesAvailable(prev => new Set([...prev, obj.data.objectTypeTag]));
      }
    });

    return () => sub.unsubscribe();
  }, [data.objectUpdates, data.objects, objectTypesAvailable]);

  useEffect(() => {
    setAvailableServerIds(new Set([...data.gameServerStatus].map(([, gs]) => gs.serverId)));

    const sub = data.gameServerUpdates.subscribe(update => {
      setAvailableServerIds(new Set([...data.gameServerStatus].map(([, gs]) => gs.serverId)));
    });

    return () => sub.unsubscribe();
  }, [data.gameServerUpdates, data.gameServerStatus]);

  const movementTypes: number[] = Object.values(AiMovementType).filter(value => typeof value === 'number') as number[];

  return (
    <div>
      {/* <span>Tracking {objectCount} Objects</span> */}
      <EuiSpacer />
      <EuiFormRow label="Object Level">
        <EuiDualRange
          showTicks
          showInput
          isDraggable
          tickInterval={20}
          min={0}
          max={100}
          value={data.objectFilters.objectLevel}
          onChange={([min, max]) => {
            const realMin = typeof min === 'number' ? min : parseInt(min);
            const realMax = typeof max === 'number' ? max : parseInt(max);

            data.dispatch({
              type: 'UPDATE_FILTERS',
              newFilters: {
                ...data.objectFilters,
                objectLevel: [realMin, realMax],
              },
            });
          }}
        />
      </EuiFormRow>
      <EuiFormRow label="Object Type">
        <EuiComboBox
          placeholder="Select one or more options"
          options={[...objectTypesAvailable].map(tagType => ({
            label: typeTagToString(tagType),
            key: `tt-${tagType}`,
            value: tagType,
          }))}
          selectedOptions={data.objectFilters.objectTypes.map(tagType => ({
            label: typeTagToString(tagType),
            key: `tt-${tagType}`,
            value: tagType,
          }))}
          onChange={selectedOptions => {
            data.dispatch({
              type: 'UPDATE_FILTERS',
              newFilters: {
                ...data.objectFilters,
                objectTypes: selectedOptions.map(selectedOption => selectedOption.value).filter(isPresent),
              },
            });
          }}
        />
      </EuiFormRow>

      <EuiFormRow label="Authorative Server">
        <EuiComboBox
          placeholder="Select one or more options"
          options={[...serverIds].map(serverId => ({
            label: `#${data.gameServerStatus.get(serverId)?.serverId ?? 0}`,
            key: `gs-${serverId}`,
            value: serverId,
          }))}
          selectedOptions={data.objectFilters.serverIds.map(serverId => ({
            label: `#${data.gameServerStatus.get(serverId)?.serverId ?? 0}`,
            key: `gs-${serverId}`,
            value: serverId,
          }))}
          onChange={selectedOptions => {
            data.dispatch({
              type: 'UPDATE_FILTERS',
              newFilters: {
                ...data.objectFilters,
                serverIds: selectedOptions.map(selectedOption => selectedOption.value).filter(isPresent),
              },
            });
          }}
        />
      </EuiFormRow>

      <EuiFormRow label="AI Activity">
        <EuiComboBox
          placeholder="Select one or more options"
          options={movementTypes.map(movementType => ({
            label: AiMovementType[movementType],
            key: `mt-${movementType}`,
            value: movementType,
          }))}
          selectedOptions={data.objectFilters.aiActivity.map(movementType => ({
            label: AiMovementType[movementType],
            key: `mt-${movementType}`,
            value: movementType,
          }))}
          onChange={selectedOptions => {
            data.dispatch({
              type: 'UPDATE_FILTERS',
              newFilters: {
                ...data.objectFilters,
                aiActivity: selectedOptions.map(selectedOption => selectedOption.value).filter(isPresent),
              },
            });
          }}
        />
      </EuiFormRow>

      <EuiFormRow label="CRC">
        <EuiFieldNumber
          placeholder="0x11230"
          value={data.objectFilters.CRC}
          onChange={e => {
            data.dispatch({
              type: 'UPDATE_FILTERS',
              newFilters: {
                ...data.objectFilters,
                CRC: parseInt(e.target.value),
              },
            });
          }}
        />
      </EuiFormRow>

      <EuiFormRow>
        <EuiSwitch
          label="Show Hibernating"
          checked={data.objectFilters.showHibernating}
          onChange={e => {
            data.dispatch({
              type: 'UPDATE_FILTERS',
              newFilters: {
                ...data.objectFilters,
                showHibernating: e.target.checked,
              },
            });
          }}
        />
      </EuiFormRow>
    </div>
  );
};

export default ObjectSummary;
