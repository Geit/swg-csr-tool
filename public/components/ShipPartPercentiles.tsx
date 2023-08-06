import {
  EuiPopover,
  EuiPopoverTitle,
  EuiTable,
  EuiTableBody,
  EuiTableHeader,
  EuiTableHeaderCell,
  EuiTableRow,
  EuiTableRowCell,
} from '@elastic/eui';
import React, { useState } from 'react';

import UGCName from './UGCName';

interface ShipPartPercentilesProps {
  headlinePercentile: number;
  isReverseEngineered: boolean;
  reverseEngineeringLevel: number;
  stats: {
    name: string;
    value?: number | null;
    percentile?: number | null;
    stajTier?: { name: string; color: string } | null;
  }[];
}

const getDisplayPercentile = (percentile?: number | null): string => {
  if (typeof percentile !== 'number') return 'Unknown';

  // Percentiles below 99 are mostly worthless, so we can just round them off.
  if (percentile < 99) {
    return `${Math.round(percentile)}%`;
  }

  // The more 9s, the better the part
  return `${percentile}%`;
};

/**
 * Takes a object's condition bits and displays a summary of set conditions, which can be expanded on mouseover
 * to display a full list of active conditions on the object.
 */
const ShipPartPercentiles: React.FC<ShipPartPercentilesProps> = ({
  headlinePercentile,
  stats,
  reverseEngineeringLevel,
  isReverseEngineered,
}) => {
  const [popOverOpen, setPopoverVisible] = useState(false);

  return (
    <EuiPopover
      button={
        <a>
          RE{reverseEngineeringLevel} - {getDisplayPercentile(headlinePercentile)}
        </a>
      }
      isOpen={popOverOpen}
      initialFocus={false}
      ownFocus={false}
      hasArrow={false}
      anchorPosition="downCenter"
      onMouseEnter={() => setPopoverVisible(true)}
      onMouseLeave={() => setPopoverVisible(false)}
    >
      {popOverOpen && (
        <>
          <EuiPopoverTitle>Part details</EuiPopoverTitle>
          <ul>
            <li>Reverse Engineering Level {reverseEngineeringLevel}</li>
            <li>Reverse Engineered Part: {isReverseEngineered ? 'yes' : 'no'}</li>
          </ul>
          <EuiTable style={{ width: '400px' }} tableLayout="fixed">
            <EuiTableHeader>
              <EuiTableHeaderCell>Stat Name</EuiTableHeaderCell>
              <EuiTableHeaderCell>Value</EuiTableHeaderCell>
              <EuiTableHeaderCell>Percentile</EuiTableHeaderCell>
              <EuiTableHeaderCell>STAJ Tier</EuiTableHeaderCell>
            </EuiTableHeader>
            <EuiTableBody>
              {stats.map(stat => (
                <EuiTableRow key={stat.name}>
                  <EuiTableRowCell>{stat.name}</EuiTableRowCell>
                  <EuiTableRowCell>{stat.value?.toFixed(3)}</EuiTableRowCell>
                  <EuiTableRowCell>{getDisplayPercentile(stat.percentile)}</EuiTableRowCell>
                  <EuiTableRowCell>
                    {stat.stajTier ? (
                      <UGCName rawName={`\\#${stat.stajTier?.color}${stat.stajTier?.name}`} />
                    ) : (
                      <>Unknown</>
                    )}
                  </EuiTableRowCell>
                </EuiTableRow>
              ))}
            </EuiTableBody>
          </EuiTable>
        </>
      )}
    </EuiPopover>
  );
};

export default ShipPartPercentiles;
