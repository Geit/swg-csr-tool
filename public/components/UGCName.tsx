import React from 'react';

interface UGCColorName {
  remainingParts: string[];
  color?: string;
}

const REGEX_COLOR_ESCAPE = /(\\#[A-Fa-f0-9]{6}|\\#)/g;

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
      let colorForSubpart: string | undefined = partToCheck.replaceAll('\\', '');

      if (colorForSubpart.length < 3) colorForSubpart = undefined;

      return (
        <span style={styles}>
          {plainParts.join('').replaceAll('\\', '')}
          <UGCColorSection color={colorForSubpart} remainingParts={remainingParts.slice(i + 1)} />
        </span>
      );
    }

    plainParts.push(partToCheck);
  }

  return <span style={styles}>{plainParts.join('').replaceAll('\\', '')}</span>;
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

/**
 * Removes modifier tokens from user generated names. This is to be used to places
 * where changing the color of the output is not possible (e.g. in the document title).
 *
 * @param content The string to strip from
 * @returns The input string with no modifiers.
 */
export const stripUGCModifiers = (content: string) => {
  return content.replaceAll(REGEX_COLOR_ESCAPE, '').replaceAll('\\', '');
};

export default UGCName;
