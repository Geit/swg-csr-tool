import React from 'react';
import { EuiSpacer, EuiCallOut } from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { isPresent } from '../../../utils/utility-types';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { FullWidthPage } from '../layouts/FullWidthPage';

import { useGetCityNameQuery } from './CityDetails.queries';
import { CitizensTable } from './CitizensTable';
import { StructuresTable } from './StructuresTable';
import { CityInformationOverview } from './CityInformationOverview';

export const GET_CITY_NAME = gql`
  query getCityName($cityId: String!) {
    city(cityId: $cityId) {
      id
      name
      rank
      specialization
    }
  }
`;

export const CityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useGetCityNameQuery({
    variables: {
      cityId: id,
    },
    returnPartialData: true,
  });

  const cityName = data?.city?.name;
  const documentTitle = [cityName, `City Details`].filter(Boolean).join(' - ');

  useDocumentTitle(documentTitle);
  useRecentlyAccessed(
    `/app/swgCsrTool/coalitions/cities/${id}`,
    documentTitle,
    `city-details-${id}`,
    Boolean(cityName)
  );
  useBreadcrumbs([
    {
      text: 'Cities',
      href: '/coalitions/cities',
    },
    {
      text: cityName ? cityName : `City ${id}`,
    },
  ]);

  const subtitleParts = [data?.city?.rank, data?.city?.specialization].filter(isPresent);

  let content = (
    <>
      <CityInformationOverview cityId={id} />
      <EuiSpacer />
      <CitizensTable cityId={id} />
      <EuiSpacer />
      <StructuresTable cityId={id} />
    </>
  );

  if (Object.keys(data?.city ?? {}).length === 0 && !loading) {
    content = (
      <>
        <EuiSpacer />
        <EuiCallOut title="City not found" color="warning" iconType="alert">
          <p>No matching city was found!</p>
        </EuiCallOut>
      </>
    );
  }

  return (
    <FullWidthPage
      title={<h1>{data?.city?.name ?? 'City Details'}</h1>}
      subtitle={subtitleParts.length > 0 ? subtitleParts.join(' - ') : undefined}
    >
      {content}
    </FullWidthPage>
  );
};
