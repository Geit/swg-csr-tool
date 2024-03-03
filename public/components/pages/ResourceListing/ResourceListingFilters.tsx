import React, { useState } from 'react';

import { resourceAttributes } from '../../../utils/resourceAttributes';

import ResourceAttributeFilter, { ResourceAttributeRangeValue } from './ResourceAttributeFilter';

export interface RangeQueryFilter {
  key: string;
  gte: number | undefined;
  lte: number | undefined;
}

const DEFAULT_MAX = 1000;
const DEFAULT_MIN = 0;

type ResourceRanges = Record<string, ResourceAttributeRangeValue | undefined>;

const convertResourceRangesToRangeQueryFilters = (resourceRanges: ResourceRanges): RangeQueryFilter[] => {
  return Object.entries(resourceRanges).flatMap(([key, value]) => {
    if (!value || (value[0] === DEFAULT_MIN && value[1] === DEFAULT_MAX)) return [];

    const range = {
      key,
      gte: undefined as number | undefined,
      lte: undefined as number | undefined,
    };

    if (value[0] !== DEFAULT_MIN) range.gte = value[0];
    if (value[1] !== DEFAULT_MAX) range.lte = value[1];

    return range;
  });
};

interface ResourceListingFiltersProps {
  initialValue?: RangeQueryFilter[];
  onChange: (value: RangeQueryFilter[]) => void;
}

const ResourceListingFilters: React.FC<ResourceListingFiltersProps> = props => {
  const [value, setValue] = useState<ResourceRanges>(() => {
    if (!props.initialValue) return {};

    const ranges = Object.fromEntries(
      props.initialValue.map(range => [
        range.key,
        [range.gte ?? DEFAULT_MIN, range.lte ?? DEFAULT_MAX] as [number, number],
      ])
    );

    return ranges;
  });
  console.log(value);

  return (
    <>
      {resourceAttributes.map(attribute => (
        <ResourceAttributeFilter
          key={attribute.id}
          label={attribute.name}
          value={value[attribute.id] ?? [0, 1000]}
          onChange={val => {
            const newFilters = { ...value, [attribute.id]: val };
            setValue(newFilters);
            const rqf = convertResourceRangesToRangeQueryFilters(newFilters);
            props.onChange(rqf);
          }}
        />
      ))}
    </>
  );
};

export default React.memo(ResourceListingFilters);
