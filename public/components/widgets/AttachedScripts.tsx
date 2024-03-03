import React from 'react';
import { gql } from '@apollo/client';
import { EuiSpacer, EuiSkeletonText, EuiText } from '@elastic/eui';

import { useGetObjectScriptsQuery } from './AttachedScripts.queries';

export const GET_OBJECT_SCRIPTS = gql`
  query getObjectScripts($objectId: String!) {
    object(objectId: $objectId) {
      id
      scriptList
    }
  }
`;

interface AttachedScriptsProps {
  objectId: string;
}

/**
 * Renders an object's variables in a Tree View.
 */
const ObjectVariables: React.FC<AttachedScriptsProps> = ({ objectId }) => {
  const { data, loading } = useGetObjectScriptsQuery({
    variables: {
      objectId,
    },
  });

  if (loading)
    return (
      <>
        <EuiSpacer />
        <EuiSkeletonText lines={5} />
      </>
    );

  if (!data?.object?.scriptList || data.object.scriptList.length === 0)
    return (
      <>
        <EuiSpacer />
        This object has no scripts.
      </>
    );

  return (
    <>
      <EuiSpacer />
      <EuiText>
        <ul>
          {data.object.scriptList.map(script => (
            <li key={script}>{script}</li>
          ))}
        </ul>
      </EuiText>
    </>
  );
};

export default ObjectVariables;
