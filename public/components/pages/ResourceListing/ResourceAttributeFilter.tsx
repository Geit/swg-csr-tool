import React, { useState } from 'react';
import { EuiDualRange, EuiFormRow } from '@elastic/eui';
import { useDebounce } from 'react-use';

export type ResourceAttributeRangeValue = [min: number, max: number];

interface ResourceAttributeFilterProps {
  label: string;
  value: ResourceAttributeRangeValue;
  onChange: (value: ResourceAttributeRangeValue) => void;
}

const ResourceAttributeFilter: React.FC<ResourceAttributeFilterProps> = props => {
  const [value, setValue] = useState<ResourceAttributeRangeValue>(props.value);

  useDebounce(
    () => {
      if (value !== props.value) props.onChange(value);
    },
    200,
    [value]
  );

  return (
    <EuiFormRow label={props.label}>
      <EuiDualRange
        tickInterval={250}
        min={0}
        max={1000}
        value={value}
        compressed
        showInput
        onChange={([min, max]) => {
          const realMin = typeof min === 'number' ? min : parseInt(min);
          const realMax = typeof max === 'number' ? max : parseInt(max);

          setValue([realMin, realMax]);
        }}
      />
    </EuiFormRow>
  );
};

export default React.memo(ResourceAttributeFilter);
