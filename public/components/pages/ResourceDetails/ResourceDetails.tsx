import React, { useEffect, useState } from 'react';
import {
  EuiSpacer,
  EuiTitle,
  EuiCallOut,
  EuiPanel,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiTabs,
  EuiTab,
  EuiBadge,
  EuiToolTip,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import UGCName, { stripUGCModifiers } from '../../UGCName';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { FullWidthPage } from '../layouts/FullWidthPage';

import { useGetResourceDetailsQuery } from './ResourceDetails.queries';
import ResourceDistributionMap from './ResourceDistributionMap';

export const GET_RESOURCE_DETAILS = gql`
  query getResourceDetails($id: String!) {
    resource(resourceId: $id) {
      id
      name
      classId
      className
      depletedTimeReal
      depletedTime
      circulationData {
        containerObjects
        totalQuantity
      }
      fractalData {
        amplitude
        octaves
        frequency
        comboRule
        gain
        bias
        yScale
        xScale
        type
        poolSizeMax
        poolSizeMin
      }
      planetDistribution {
        sceneId
        sceneName
        planetId
        seed
      }
      attributes {
        attributeId
        value
        attributeName
      }
    }
  }
`;

export const ResourceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const { data, loading } = useGetResourceDetailsQuery({
    variables: {
      id,
    },
    returnPartialData: true,
  });

  const resourceName = data?.resource?.name;
  const documentTitle = stripUGCModifiers([resourceName, `Resource Details`].filter(Boolean).join(' - '));

  useDocumentTitle(documentTitle);
  useRecentlyAccessed(
    `/app/swgCsrTool/resources/${id}`,
    documentTitle,
    `resource-details-${id}`,
    Boolean(resourceName)
  );
  useBreadcrumbs([
    {
      text: 'Resource Listing',
      href: '/resources',
    },
    {
      text: documentTitle,
    },
  ]);

  const planetDistribution = data?.resource?.planetDistribution?.find(p => p.planetId === selectedPlanet);

  useEffect(() => {
    const newDist = data?.resource?.planetDistribution?.find(p => p.planetId === selectedPlanet);

    if (!newDist) setSelectedPlanet(data?.resource?.planetDistribution?.[0]?.planetId ?? null);
  }, [data?.resource?.planetDistribution, selectedPlanet]);

  const depletedTime = data?.resource?.depletedTimeReal && new Date(data?.resource?.depletedTimeReal);

  let content = (
    <>
      <EuiTitle>
        <h2>Stats</h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiPanel color="subdued" hasBorder>
        <EuiDescriptionList className="objectInformationList" textStyle="reverse">
          {depletedTime ? (
            <div key={`status`}>
              <EuiDescriptionListTitle>Status</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
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
              </EuiDescriptionListDescription>
            </div>
          ) : (
            <EuiBadge color="danger">Unknown</EuiBadge>
          )}
          {data?.resource?.attributes?.map((attribute, index) => {
            return (
              <div key={`attribute-${attribute.attributeId}`}>
                <EuiDescriptionListTitle key={`title-${index}`}>
                  {attribute.attributeName ?? attribute.attributeId}
                </EuiDescriptionListTitle>
                <EuiDescriptionListDescription key={`description-${index}`}>
                  {attribute.value}
                </EuiDescriptionListDescription>
              </div>
            );
          })}
          <div key={`amountInCirculation`}>
            <EuiDescriptionListTitle>Amount in Circulation</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {(data?.resource?.circulationData?.totalQuantity ?? 0).toLocaleString()}
            </EuiDescriptionListDescription>
          </div>
          <div key={`totalContainers`}>
            <EuiDescriptionListTitle>Total Containers</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {(data?.resource?.circulationData?.containerObjects ?? 0).toLocaleString()}
            </EuiDescriptionListDescription>
          </div>
        </EuiDescriptionList>
      </EuiPanel>
      <EuiSpacer />
      {data?.resource?.fractalData && data.resource?.planetDistribution && planetDistribution && (
        <>
          <EuiTitle>
            <h2>Distribution</h2>
          </EuiTitle>
          <EuiSpacer />
          <EuiPanel color="subdued" hasBorder>
            <EuiTabs>
              {data.resource.planetDistribution.map(planet => (
                <EuiTab
                  key={planet.planetId}
                  onClick={() => setSelectedPlanet(planet.planetId)}
                  isSelected={planet.planetId === selectedPlanet}
                >
                  {planet.sceneName || planet.sceneId || planet.planetId}
                </EuiTab>
              ))}
            </EuiTabs>
            <EuiSpacer />
            <ResourceDistributionMap
              {...data.resource.fractalData}
              seed={planetDistribution.seed}
              scene={planetDistribution.sceneId!}
            />
          </EuiPanel>
        </>
      )}
    </>
  );

  if (Object.keys(data?.resource ?? {}).length === 0 && !loading) {
    content = (
      <EuiCallOut title="Resource not found" color="warning" iconType="alert">
        <p>No matching resource was found!</p>
      </EuiCallOut>
    );
  }

  return (
    <FullWidthPage
      title={<UGCName rawName={data?.resource?.name ?? 'Resource Details'} />}
      subtitle={data?.resource?.className}
    >
      {content}
    </FullWidthPage>
  );
};
