import React, { useContext, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiText,
  EuiCallOut,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { KibanaCoreServicesContext } from '../../KibanaCoreServicesContext';
import { isPresent } from '../../../utils/utility-types';

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
  const { coreServices } = useContext(KibanaCoreServicesContext);
  const { data, loading } = useGetCityNameQuery({
    variables: {
      cityId: id,
    },
    returnPartialData: true,
  });

  const cityName = data?.city?.name;

  useEffect(() => {
    const title = [cityName, `City Details`].filter(Boolean).join(' - ');

    coreServices?.chrome.docTitle.change(title);

    if (cityName) {
      coreServices?.chrome.recentlyAccessed.add(`/app/swgCsrTool/coalitions/cities/${id}`, title, `city-details-${id}`);
    }
  }, [coreServices, cityName]);

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
    <EuiPage paddingSize="l" restrictWidth>
      <EuiPageBody panelled borderRadius={10}>
        <EuiPageHeaderSection>
          <>
            <EuiTitle size="l">
              <h1>{data?.city?.name ?? 'City Details'}</h1>
            </EuiTitle>
            {subtitleParts.length > 0 && <EuiText color="subdued">{subtitleParts.join(' - ')}</EuiText>}
          </>
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          {content}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
