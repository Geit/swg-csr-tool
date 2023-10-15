import { EuiPopover, EuiPopoverTitle, EuiText } from '@elastic/eui';
import React, { useState } from 'react';

/**
 * List of available conditions.
 *
 * Sourced from: src/engine/client/library/clientGame/src/shared/object/TangibleObject.h
 */
enum Conditions {
  OnOff = 0x00000001,
  Vendor = 0x00000002,
  Insured = 0x00000004,
  Conversable = 0x00000008,
  Hibernating = 0x00000010,
  MagicItem = 0x00000020,
  Aggressive = 0x00000040,
  WantSawAttackTrigger = 0x00000080,
  Invulnerable = 0x00000100,
  Disabled = 0x00000200,
  Uninsurable = 0x00000400,
  Interesting = 0x00000800,
  Mount = 0x00001000,
  Crafted = 0x00002000,
  WingsOpened = 0x00004000,
  SpaceInteresting = 0x00008000,
  Docking = 0x00010000,
  Destroying = 0x00020000,
  Commable = 0x00040000,
  Dockable = 0x00080000,
  Eject = 0x00100000,
  Inspectable = 0x00200000,
  Transferable = 0x00400000,
  InflightTutorial = 0x00800000,
  SpaceCombatMusic = 0x01000000,
  EncounterLocked = 0x02000000,
  SpawnedCreature = 0x04000000,
  HolidayInteresting = 0x08000000,
  Locked = 0x10000000,
}

interface ConditionListingProps {
  conditionBits: number;
}

/**
 * Takes a object's condition bits and displays a summary of set conditions, which can be expanded on mouseover
 * to display a full list of active conditions on the object.
 */
const ConditionListing: React.FC<ConditionListingProps> = ({ conditionBits }) => {
  const [popOverOpen, setPopoverVisible] = useState(false);
  if (conditionBits === 0) {
    return <>No Conditions Set</>;
  }

  const enabledConditions = Object.entries(Conditions).filter(
    ([_conditionName, conditionMask]) => typeof conditionMask === 'number' && conditionBits & conditionMask
  );

  const enabledConditionNames = enabledConditions.map(([conditionName]) => conditionName);

  return (
    <EuiPopover
      button={
        <a>
          {enabledConditionNames.length} Condition{enabledConditionNames.length !== 1 && 's'} Set
        </a>
      }
      isOpen={popOverOpen}
      ownFocus={false}
      hasArrow={false}
      anchorPosition="downCenter"
      onMouseEnter={() => setPopoverVisible(true)}
      onMouseLeave={() => setPopoverVisible(false)}
    >
      {popOverOpen && (
        <>
          <EuiPopoverTitle>Conditions Set</EuiPopoverTitle>
          <EuiText>
            <ul>
              {enabledConditionNames.map(conditionName => (
                <li key={conditionName}>{conditionName}</li>
              ))}
            </ul>
          </EuiText>
        </>
      )}
    </EuiPopover>
  );
};

export default ConditionListing;
