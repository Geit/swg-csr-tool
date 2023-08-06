import { EuiSkeletonText } from '@elastic/eui';
import React from 'react';

interface SimpleValueProps {
  children?: any | null;
  isLoading: boolean;
  fallbackText?: string;
  numeric?: boolean;
}

/**
 * Renders a simple value, or a loading state.
 */
const SimpleValue: React.FC<SimpleValueProps> = ({ children, isLoading, fallbackText = 'Not Set', numeric }) => {
  if (!children) {
    if (isLoading) return <EuiSkeletonText lines={1} />;

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{fallbackText}</>;
  }

  if (numeric) return <code>{children}</code>;

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default SimpleValue;
