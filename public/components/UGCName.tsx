import React from 'react';

interface UGCColorName {
  remainingParts: string[];
  color?: string;
}

const REGEX_COLOR_ESCAPE = /(\\#[A-Fa-f0-9]{6})/;

const UGCColorSection: React.FC<UGCColorName> = ({ remainingParts, color = 'currentcolor' }) => {
  const plainParts: string[] = [];

  const styles = {
    color,
    ...(color !== 'currentcolor' && {
      WebkitTextStroke: '0.02ex black',
    }),
  };

  for (let i = 0; i < remainingParts.length; i++) {
    const partToCheck = remainingParts[i];

    if (REGEX_COLOR_ESCAPE.test(partToCheck)) {
      return (
        <span style={styles}>
          {plainParts.join('')}
          <UGCColorSection color={partToCheck.replaceAll('\\', '')} remainingParts={remainingParts.slice(i + 1)} />
        </span>
      );
    }

    plainParts.push(partToCheck);
  }

  return <span style={styles}>{plainParts.join('')}</span>;
};

interface UGCNameProps {
  rawName?: string | null;
}

/**
 * Handles coloring user generated names of objects etc
 */
const UGCName: React.FC<UGCNameProps> = ({ rawName }) => {
  if (!rawName) return <span>Unknown object</span>;

  const rawNameParts = rawName.split(REGEX_COLOR_ESCAPE);

  return <UGCColorSection remainingParts={rawNameParts} />;
};

export default UGCName;
