import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { EuiFieldSearch, EuiHorizontalRule, EuiLink, EuiPopover, EuiPopoverTitle } from '@elastic/eui';
import { DataView } from '@kbn/data-views-plugin/common';

import { isPresent } from '../../../utils/utility-types';
import { useKibanaPlugins } from '../../../hooks/useKibanaPlugins';

import { LogCategory } from './LogCategory';

interface CategoryHeaderProps {}

const categorySearchResult = css`
  display: flex;
  align-items: center;

  height: 32px;
  width: 216px;
  padding: 8px;

  > * {
    height: 24px;
    display: flex;
    align-items: center;
  }
`;

const FIELD_NAME = 'category.keyword';
const NUM_RESULTS = 7;

export const CategoryHeader: React.FC<CategoryHeaderProps> = props => {
  const { data: dataPlugin } = useKibanaPlugins();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dataView, setDataView] = useState<DataView>();
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [elasticResults, setElasticResults] = useState<any>();

  useEffect(() => {
    let canceled = false;
    const loadDataView = async () => {
      if (!popoverOpen) return;
      const [loadedDataView] = await dataPlugin.dataViews.find('legends_log_alias');
      if (canceled) return;
      setDataView(loadedDataView);
    };

    loadDataView();
    return () => {
      canceled = true;
    };
  }, [dataPlugin, popoverOpen]);

  useEffect(() => {
    const abortController = new AbortController();
    const search = async () => {
      if (!dataView || !popoverOpen) return;
      setIsLoading(true);
      const searchSource = await dataPlugin.search.searchSource.create();
      searchSource.setField('index', dataView);
      searchSource.setField('size', 0);
      searchSource.setField(
        'filter',
        [
          searchValue
            ? {
                meta: {},
                // eslint-disable-next-line camelcase
                query: { wildcard: { [FIELD_NAME]: { value: `*${searchValue}*`, case_insensitive: true } } },
              }
            : null,
          {
            meta: {},

            query: {
              range: {
                '@timestamp': {
                  gte: 'now-180d',
                  lte: 'now',
                },
              },
            },
          },
        ].filter(isPresent)
      );
      searchSource.setField('aggs', {
        0: {
          terms: {
            field: FIELD_NAME,
            // order: {
            //   _count: 'desc',
            // },
            size: NUM_RESULTS,
            // eslint-disable-next-line camelcase
            shard_size: 25,
          },
        },
      });
      const resp = await searchSource.fetch({
        abortSignal: abortController.signal,
        sessionId: `${Math.random()}`,
        legacyHitsTotal: false,
      });
      setElasticResults(resp.aggregations as any);
      setIsLoading(false);
    };

    search().catch(error => {
      setIsLoading(false);
      if (error.name === 'AbortError') {
        // ignore abort errors
      } else {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    });

    return () => {
      abortController.abort();
    };
  }, [dataView, dataPlugin.search.searchSource, popoverOpen, searchValue]);

  return (
    <EuiPopover
      panelPaddingSize="none"
      button={<EuiLink onClick={() => setPopoverOpen(true)}>Category</EuiLink>}
      isOpen={popoverOpen}
      ownFocus={false}
      closePopover={() => setPopoverOpen(false)}
    >
      <EuiPopoverTitle paddingSize="s">
        <EuiFieldSearch
          className={css`
            width: 200px;
          `}
          placeholder="Filter categories"
          value={searchValue}
          isClearable
          onChange={e => setSearchValue(e.target.value)}
          isLoading={isLoading}
        />
      </EuiPopoverTitle>
      {elasticResults?.[0].buckets.map((bucket: any, idx: number) => {
        return (
          <>
            {idx > 0 ? <EuiHorizontalRule key={`hr-${bucket.key}`} margin="none" /> : null}
            <div className={categorySearchResult} key={bucket.key}>
              <LogCategory category={bucket.key} />
            </div>
          </>
        );
      }) ?? []}
    </EuiPopover>
  );
};
