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
    <div>
      {props.count > 1 && <span>{props.count}&nbsp;x&nbsp;</span>}
      <UGCName rawName={props.name} />
    </div>
  );

  return <ObjectLink objectId={props.oid} textToDisplay={displayText} />;
};

export default TransactionItem;
