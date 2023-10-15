import React, { ReactElement } from 'react';

import ObjectLink from '../../ObjectLink/ObjectLink';

const OBJECT_ID_REGEX = /(\d{11,})/g;

interface LogMessageSectionProps {
  remainingParts: string[];
}

const LogMessageSection: React.FC<LogMessageSectionProps> = ({ remainingParts }) => {
  const parts: ReactElement[] = [];

  for (let i = 0; i < remainingParts.length; i++) {
    const partToCheck = remainingParts[i];

    if (OBJECT_ID_REGEX.test(partToCheck)) {
      parts.push(
        <ObjectLink objectId={partToCheck} key={i} display="inline">
          {partToCheck}
        </ObjectLink>
      );
      continue;
    }

    parts.push(<span key={i}>{partToCheck}</span>);
  }

  return <span>{parts}</span>;
};

interface LogMessageProps {
  message: string;
}

export const LogMessage: React.FC<LogMessageProps> = ({ message }) => {
  const logMessageParts = message.split(OBJECT_ID_REGEX);

  return <LogMessageSection remainingParts={logMessageParts} />;
};
