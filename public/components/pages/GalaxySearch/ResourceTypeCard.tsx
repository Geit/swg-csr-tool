import React from 'react';
import {
  EuiBadge,
  EuiDescriptionList,
  EuiDescriptionListDescription,
  EuiDescriptionListTitle,
  EuiToolTip,
} from '@elastic/eui';

import { resourceAttributes } from '../../../utils/resourceAttributes';

import { SearchResultCard } from './SearchResultCard';
import { ResultIcon } from './ResultIcon';

import { ResourceTypeResult } from '.';

export const ResourceTypeCard: React.FC<{ resource: ResourceTypeResult }> = ({ resource }) => {
  const depletedTime = resource.depletedTimeReal ? new Date(resource.depletedTimeReal) : null;

  return (
    <SearchResultCard
      href={`/resources/${resource.id}`}
      title={
        (
          <span>
            <ResultIcon resultType={resource.__typename} />
            {resource.name}
          </span>
        ) ?? 'Unknown resource'
      }
    >
      <EuiDescriptionList className="galaxySearchKeyValues" textStyle="reverse">
        <div>
          <EuiDescriptionListTitle>Type</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{resource.__typename}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Resource ID</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{resource.id}</EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>Attributes</EuiDescriptionListTitle>
          <EuiDescriptionListDescription style={{ display: 'flex', gap: '20px' }}>
            {resourceAttributes.map(attribute => {
              const resAttrib = resource.attributes?.find(a => a.attributeId === attribute.id);

              return (
                <div key={`attribute-${attribute.id}`}>
                  {resAttrib?.value ?? '--'} <abbr title={attribute.name}>{attribute.abbr}</abbr>
                </div>
              );
            })}
          </EuiDescriptionListDescription>
        </div>
        <div>
          <EuiDescriptionListTitle>State</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {depletedTime ? (
              <EuiToolTip
                position="top"
                content={`Expiry on ${depletedTime.toLocaleString(undefined, {
                  dateStyle: 'full',
                  timeStyle: 'long',
                })}`}
              >
                {depletedTime > new Date() ? (
                  <EuiBadge color="success">Active</EuiBadge>
                ) : (
                  <EuiBadge color="danger">Inactive</EuiBadge>
                )}
              </EuiToolTip>
            ) : (
              <EuiBadge color="danger">Unknown</EuiBadge>
            )}
          </EuiDescriptionListDescription>
        </div>
      </EuiDescriptionList>
    </SearchResultCard>
  );
};
