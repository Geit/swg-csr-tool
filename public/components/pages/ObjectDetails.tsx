import React from 'react';
import { EuiPage, EuiPageBody, EuiPageHeader, EuiPageContent, EuiSpacer } from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import ObjectInfoWidget from '../widgets/BasicObjectKeyValues';
import ContentsOfObject from '../widgets/ContentsOfObject';
import TabbedExtendedObjectDetails from '../widgets/TabbedExtendedObjectDetails';

import { useGetObjectNameQuery } from './ObjectDetails.queries';

export const GET_OBJECT_NAME = gql`
  query getObjectName($id: String!) {
    object(objectId: $id) {
      __typename
      id
      resolvedName
    }
  }
`;

const ObjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useGetObjectNameQuery({
    variables: {
      id,
    },
    returnPartialData: true,
  });

  return (
    <EuiPage paddingSize="l" restrictWidth>
      <EuiPageBody panelled borderRadius={10}>
        <EuiPageHeader pageTitle={data?.object?.resolvedName ?? 'Object details'} paddingSize="s" />
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          <ObjectInfoWidget objectId={id} />
          <EuiSpacer />
          <ContentsOfObject objectId={id} />
          <TabbedExtendedObjectDetails key={id} objectId={id} objectType={data?.object?.__typename} />

          {/* Prevents this page being sized based on its content */}
          <EuiSpacer style={{ width: '2000px' }} />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default ObjectDetails;
