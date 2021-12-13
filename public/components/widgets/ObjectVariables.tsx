import React from 'react';
import { gql } from '@apollo/client';
import { EuiSpacer, EuiLoadingContent, EuiTreeViewProps, EuiToken, EuiTreeView } from '@elastic/eui';
import groupBy from 'lodash.groupby';
import reduce from 'lodash.reduce';

import {
  ObjVarFloat,
  ObjVarFloatArray,
  ObjVarInt,
  ObjVarIntArray,
  ObjVarString,
  ObjVarStringArray,
  ObjVarUnion,
} from '../../graphql.generated';

import { useGetObjectObjVarsQuery } from './ObjectVariables.queries';

export const GET_OBJECT_OBJVARS = gql`
  query getObjectObjVars($objectId: String!) {
    object(objectId: $objectId) {
      id
      objVars {
        __typename
        ... on ObjVarInt {
          name
          intValue
        }
        ... on ObjVarString {
          name
          strValue
        }

        ... on ObjVarFloat {
          name
          floatValue
        }

        ... on ObjVarIntArray {
          name
          intValues
        }

        ... on ObjVarFloatArray {
          name
          floatValues
        }

        ... on ObjVarStringArray {
          name
          strValues
        }
      }
    }
  }
`;

interface ObjectVariableProps {
  objectId: string;
}

/**
 * Map of components for each ObjVar Type that can be returned
 * from the GET_OBJECT_OBJVARS query above. These are passed into
 * EuiTreeView - so need to be in a format that can render.
 */
const ObjvarLeafNodes: Record<Required<ObjVarUnion>['__typename'], (objVar: any) => EuiTreeViewProps['items'][number]> =
  {
    ObjVarString(objVar: ObjVarString) {
      const nameParts = objVar.name.split('.');

      const name = nameParts[nameParts.length - 1];

      return {
        id: objVar.name,
        label: <span title={name}>{name}</span>,
        icon: <EuiToken size="xs" iconType="tokenString" />,
        children: [
          {
            id: `${name}-value`,
            label: objVar.strValue,
          },
        ],
      };
    },
    ObjVarStringArray(objVar: ObjVarStringArray) {
      const nameParts = objVar.name.split('.');

      const name = nameParts[nameParts.length - 1];

      return {
        id: objVar.name,
        label: <span title={name}>{name}</span>,
        icon: <EuiToken size="xs" iconType="tokenArray" />,
        children: [
          {
            id: `${name}-value`,
            label: `[${objVar.strValues.join(',')}]`,
          },
        ],
      };
    },
    ObjVarFloat(objVar: ObjVarFloat) {
      const nameParts = objVar.name.split('.');

      const name = nameParts[nameParts.length - 1];

      return {
        id: objVar.name,
        label: <span title={name}>{name}</span>,
        icon: <EuiToken size="xs" iconType="tokenNumber" />,
        children: [
          {
            id: `${name}-value`,
            label: objVar.floatValue,
          },
        ],
      };
    },
    ObjVarFloatArray(objVar: ObjVarFloatArray) {
      const nameParts = objVar.name.split('.');

      const name = nameParts[nameParts.length - 1];

      return {
        id: objVar.name,
        label: <span title={name}>{name}</span>,
        icon: <EuiToken size="xs" iconType="tokenArray" />,
        children: [
          {
            id: `${name}-value`,
            label: `[${objVar.floatValues.join(',')}]`,
          },
        ],
      };
    },
    ObjVarInt(objVar: ObjVarInt) {
      const nameParts = objVar.name.split('.');

      const name = nameParts[nameParts.length - 1];

      return {
        id: objVar.name,
        label: <span title={name}>{name}</span>,
        icon: <EuiToken size="xs" iconType="tokenNumber" />,
        children: [
          {
            id: `${name}-value`,
            label: objVar.intValue,
          },
        ],
      };
    },
    ObjVarIntArray(objVar: ObjVarIntArray) {
      const nameParts = objVar.name.split('.');

      const name = nameParts[nameParts.length - 1];

      return {
        id: objVar.name,
        label: <span title={name}>{name}</span>,
        icon: <EuiToken size="xs" iconType="tokenArray" />,
        children: [
          {
            id: `${name}-value`,
            label: `[${objVar.intValues.join(',')}]`,
          },
        ],
      };
    },
  };

/**
 * Converts an incoming set of ObjVars from the query above into a tree
 * that can be rendered by EuiTreeView
 */
const convertItemsToTree = (items: Omit<ObjVarUnion, 'type'>[], level = 0): EuiTreeViewProps['items'] => {
  return reduce(
    groupBy(items, objVar => objVar.name.split('.')[level]),
    (accValue: EuiTreeViewProps['items'], currentValue, key) => {
      // This can happen if a leaf is also a branch.
      // (i.e. if objvar.b has a value, and objvar.b.c also exists)
      if (key === 'undefined') {
        const result = ObjvarLeafNodes[currentValue[0].__typename ?? 'ObjVarFloat'](currentValue[0]);

        if (result && result.children) {
          accValue.push(result.children[0]);
        }

        return accValue;
      }

      // This is a leaf node
      if (currentValue.length === 1 && currentValue[0].name.endsWith(key)) {
        accValue.push(ObjvarLeafNodes[currentValue[0].__typename ?? 'ObjVarFloat'](currentValue[0]));

        return accValue;
      }

      // This is a branch node.
      accValue.push({
        id: key,
        label: key,
        icon: <EuiToken size="xs" iconType="tokenObject" />,
        children: convertItemsToTree(currentValue, level + 1),
      });

      return accValue;
    },
    []
  );
};

/**
 * Renders an object's variables in a Tree View.
 */
const ObjectVariables: React.FC<ObjectVariableProps> = ({ objectId }) => {
  const { data, loading } = useGetObjectObjVarsQuery({
    variables: {
      objectId,
    },
  });

  if (loading)
    return (
      <>
        <EuiSpacer />
        <EuiLoadingContent lines={5} />
      </>
    );

  if (!data?.object?.objVars || data.object.objVars.length === 0)
    return (
      <>
        <EuiSpacer />
        This object has no variables set.
      </>
    );

  const treeData = convertItemsToTree(data.object.objVars);

  return (
    <>
      <EuiSpacer />
      <EuiTreeView
        className="objVarTree"
        items={treeData}
        display="compressed"
        showExpansionArrows
        aria-label="Object Variables"
      />
    </>
  );
};

export default ObjectVariables;
