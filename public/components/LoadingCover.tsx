import React from 'react';
import { EuiDelayRender, EuiLoadingSpinner } from '@elastic/eui';

interface Props {
  isLoading: boolean;
  delay?: number;
  children: React.ReactNode;
}

const LoadingCover: React.FC<Props> = ({ children, isLoading, delay = 1000 }) => {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {isLoading && (
        <EuiDelayRender delay={delay}>
          <div
            style={{
              width: '100%',
              height: '100%',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(0.1rem)',

              position: 'absolute',
              top: '0',
              left: '0',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EuiLoadingSpinner size="xl" style={{ position: 'sticky', top: '50vh', bottom: '50vh' }} />
          </div>
        </EuiDelayRender>
      )}
    </div>
  );
};

export default LoadingCover;
