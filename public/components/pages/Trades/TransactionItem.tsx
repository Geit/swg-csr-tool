import React from 'react';

import ObjectLink from '../../ObjectLink';
import UGCName from '../../UGCName';

interface TransactionItemProps {
  oid: string;
  name: string;
  count: number;
}

const TransactionItem: React.FC<TransactionItemProps> = props => {
  const displayText = (
    <>
      {props.count > 1 && <span>{props.count.toLocaleString()}&nbsp;x&nbsp;</span>}
      <UGCName rawName={props.name} />
    </>
  );

  return <ObjectLink objectId={props.oid} textToDisplay={displayText} />;
};

export default TransactionItem;
