import React from 'react';
import { EuiSpacer, EuiCallOut } from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import ObjectInfoWidget from '../../widgets/BasicObjectKeyValues';
import ContentsOfObject from '../../widgets/ContentsOfObject';
import TabbedExtendedObjectDetails from '../../widgets/TabbedExtendedObjectDetails';
import UGCName, { stripUGCModifiers } from '../../UGCName';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useRecentlyAccessed } from '../../../hooks/useRecentlyAccessed';
import { useBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { FullWidthPage } from '../layouts/FullWidthPage';

import { useGetObjectNameQuery } from './ObjectDetails.queries';

export const GET_OBJECT_NAME = gql`
  query getObjectName($id: String!) {
    object(objectId: $id) {
      __typename
      id
      resolvedName
      basicName: resolvedName(resolveCustomNames: false)

      ... on PlayerCreatureObject {
        account {
          id
        }
      }
    }
  }
`;

export const ObjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useGetObjectNameQuery({
    variables: {
      id,
    },
    returnPartialData: true,
  });

  const objectName = data?.object?.resolvedName;
  const documentTitle = stripUGCModifiers([objectName, `Object Details`].filter(Boolean).join(' - '));

  useDocumentTitle(documentTitle);
  useRecentlyAccessed(`/app/swgCsrTool/object/${id}`, documentTitle, `object-details-${id}`, Boolean(objectName));
  useBreadcrumbs([
    {
      text: 'Galaxy Search',
      href: '/search',
    },
    {
      text: documentTitle,
    },
  ]);

  let content = (
    <>
      <ObjectInfoWidget objectId={id} />
      <EuiSpacer />
      <ContentsOfObject objectId={id} />
      <TabbedExtendedObjectDetails
        key={id}
        objectId={id}
        objectType={data?.object?.__typename}
        // This next line is horrible, sorry.
        stationId={data && data.object && 'account' in data.object ? data.object.account?.id : undefined}
      />
    </>
  );

  if (Object.keys(data?.object ?? {}).length === 0 && !loading) {
    content = (
      <EuiCallOut title="Object not found" color="warning" iconType="alert">
        <p>No matching object was found!</p>
      </EuiCallOut>
    );
  }

  const title = <UGCName rawName={data?.object?.resolvedName} /> ?? 'Object Details';

  let subtitle: string | undefined;
  if (data?.object?.resolvedName !== data?.object?.basicName) {
    subtitle = data?.object?.basicName;
  }

  return (
    <FullWidthPage title={title} subtitle={subtitle}>
      {content}
    </FullWidthPage>
  );
};
