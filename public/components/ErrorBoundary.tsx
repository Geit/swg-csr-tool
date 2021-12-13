import { EuiCallOut } from '@elastic/eui';
import React, { ErrorInfo } from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <EuiCallOut title="Application Crashed!" color="danger" iconType="alert">
          <p>A fatal error has occured. Please report this error and reload the page.</p>
        </EuiCallOut>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
