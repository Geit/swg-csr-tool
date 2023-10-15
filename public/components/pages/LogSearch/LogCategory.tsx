import React from 'react';
import { css } from '@emotion/css';
import { EuiButtonIcon } from '@elastic/eui';
import classNames from 'classnames';

import { useKibanaPlugins } from '../../../hooks/useKibanaPlugins';

interface LogMessageProps {
  category: string;
}

const categoryStyles = css`
  display: inline-block;
  position: relative;
  width: 100%;
`;

const actionButtons = css`
  position: absolute;
  right: 0;
  top: 0;
  user-select: none;
`;

export const LogCategory: React.FC<LogMessageProps> = ({ category }) => {
  const services = useKibanaPlugins();

  const addFilter = (negate: boolean) => {
    services.data.query.filterManager.addFilters({
      meta: {
        disabled: false,
        negate,
        alias: null,
        key: 'category',
        params: { query: category },
        type: 'phrase',
      },
      // eslint-disable-next-line camelcase
      query: { match_phrase: { category } },
    });
  };

  return (
    <span className={categoryStyles}>
      {category}
      <span className={classNames(actionButtons, 'actionButtons')}>
        <EuiButtonIcon
          onClick={() => {
            addFilter(false);
          }}
          iconType="plusInCircle"
          aria-label={`Filter for only ${category}`}
          title={`Filter for only ${category}`}
        />
        <EuiButtonIcon
          onClick={() => {
            addFilter(true);
          }}
          iconType="minusInCircle"
          aria-label={`Filter out ${category}`}
          title={`Filter out ${category}`}
        />
      </span>
    </span>
  );
};
