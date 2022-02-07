import React, { useContext, useEffect } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiText,
  EuiPanel,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { KibanaCoreServicesContext } from '../../KibanaCoreServicesContext';
import { isPresent } from '../../../utils/utility-types';
import SimpleValue from '../../SimpleValue';
import ObjectLink from '../../ObjectLink';

import { useGetCityDetailsQuery } from './CityDetails.queries';
import { CitizensTable } from './CitizensTable';
import { StructuresTable } from './StructuresTable';

export const GET_CITY_DETAILS = gql`
  query getCityDetails($cityId: String!) {
    city(cityId: $cityId) {
      id
      name
      rank
      radius
      specialization
      location
      planet
      citizenCount
      structureCount
      incomeTax
      propertyTax
      salesTax
      creationTime
      travelCost

      mayor {
        id
        resolvedName
      }
    }
  }
`;

export const CityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { coreServices } = useContext(KibanaCoreServicesContext);
  const { data, loading } = useGetCityDetailsQuery({
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

  const CityInformation = [
    {
      title: 'City ID',
      description: (
        <SimpleValue isLoading={loading} numeric>
          {data?.city?.id}
        </SimpleValue>
      ),
    },
    {
      title: 'Location',
      description: (
        <SimpleValue isLoading={loading} numeric>
          {[data?.city?.location?.map(Math.round).join(' ')].filter(Boolean).join(' - ')}
          <EuiText color="subdued" size="xs">
            {data?.city?.planet ?? 'Unknown Planet'}
          </EuiText>
        </SimpleValue>
      ),
    },
    {
      title: 'Mayor',
      description: (
        <SimpleValue isLoading={loading}>
          {data?.city?.mayor?.id ? (
            <ObjectLink objectId={data?.city?.mayor?.id} textToDisplay={data?.city?.mayor?.resolvedName} />
          ) : null}
        </SimpleValue>
      ),
    },
    {
      title: 'Rank',
      description: <SimpleValue isLoading={loading}>{data?.city?.rank}</SimpleValue>,
    },
    {
      title: 'Radius',
      description: (
        <SimpleValue isLoading={loading} numeric>
          {data?.city?.radius ?? 0}m
        </SimpleValue>
      ),
    },
    {
      title: 'Specialization',
      description: <SimpleValue isLoading={loading}>{data?.city?.specialization}</SimpleValue>,
    },
    {
      title: 'Tax Rates',
      description: (
        <SimpleValue isLoading={loading} numeric>
          <EuiText size="xs">{data?.city?.travelCost ?? 0} Credits Travel Tax</EuiText>
          <EuiText size="xs">{data?.city?.incomeTax ?? 0} Credits Income Tax</EuiText>
          <EuiText size="xs">{data?.city?.salesTax ?? 0}% Sales Tax</EuiText>
          <EuiText size="xs">{data?.city?.propertyTax ?? 0}% Property Tax</EuiText>
        </SimpleValue>
      ),
    },
    {
      title: 'Founded',
      description: (
        <SimpleValue isLoading={loading} numeric>
          {data?.city?.creationTime
            ? new Date(data?.city?.creationTime * 1000).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short',
              })
            : null}
        </SimpleValue>
      ),
    },
  ];

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
          <EuiPanel color="subdued" hasBorder>
            <EuiDescriptionList className="objectInformationList" textStyle="reverse">
              {CityInformation.map((item, index) => {
                return (
                  <div key={`container-${index}`}>
                    <EuiDescriptionListTitle key={`title-${index}`}>{item.title}</EuiDescriptionListTitle>
                    <EuiDescriptionListDescription key={`description-${index}`}>
                      {item.description}
                    </EuiDescriptionListDescription>
                  </div>
                );
              })}
            </EuiDescriptionList>
          </EuiPanel>
          <EuiSpacer />
          <CitizensTable />
          <EuiSpacer />
          <StructuresTable />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
