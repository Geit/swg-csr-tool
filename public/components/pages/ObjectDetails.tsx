import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiSpacer,
  EuiPageHeaderSection,
  EuiTitle,
  EuiCallOut,
  EuiText,
} from '@elastic/eui';
import { gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import ObjectInfoWidget from '../widgets/BasicObjectKeyValues';
import ContentsOfObject from '../widgets/ContentsOfObject';
import TabbedExtendedObjectDetails from '../widgets/TabbedExtendedObjectDetails';
import UGCName from '../UGCName';

import { useGetObjectNameQuery } from './ObjectDetails.queries';

export const GET_OBJECT_NAME = gql`
  query getObjectName($id: String!) {
    object(objectId: $id) {
      __typename
      id
      resolvedName
      basicName: resolvedName(resolveCustomNames: false)
    }
  }
`;

const ObjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useGetObjectNameQuery({
    variables: {
      id,
    },
    returnPartialData: true,
  });

  let content = (
    <>
      <ObjectInfoWidget objectId={id} />
      <EuiSpacer />
      <ContentsOfObject objectId={id} />
      <TabbedExtendedObjectDetails key={id} objectId={id} objectType={data?.object?.__typename} />

      {/* Prevents this page being sized based on its content */}
      <EuiSpacer style={{ width: '2000px' }} />
    </>
  );

  if (Object.keys(data?.object ?? {}).length === 0 && !loading) {
    content = (
      <EuiCallOut title="Object not found" color="warning" iconType="alert">
        <p>No matching object was found!</p>
      </EuiCallOut>
    );
  }

  return (
    <EuiPage paddingSize="l" restrictWidth>
      <EuiPageBody panelled borderRadius={10}>
        <EuiPageHeaderSection>
          {data?.object?.resolvedName === data?.object?.basicName ? (
            <EuiTitle size="l">
              <h1>{data?.object?.resolvedName ?? 'Object Details'}</h1>
            </EuiTitle>
          ) : (
            <>
              <EuiTitle size="l">
                <h1>
                  <UGCName rawName={data?.object?.resolvedName ?? 'Object Details'} />
                </h1>
              </EuiTitle>
              <EuiText color="subdued">{data?.object?.basicName}</EuiText>
            </>
          )}
          <EuiSpacer />
        </EuiPageHeaderSection>
        <EuiPageContent paddingSize="none" color="transparent" hasBorder={false} borderRadius="none">
          {content}
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default ObjectDetails;
