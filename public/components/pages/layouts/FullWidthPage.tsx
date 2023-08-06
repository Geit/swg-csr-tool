import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageHeaderSection,
  EuiPageSection,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React from 'react';

import AppSidebar from '../../AppSidebar';

interface FullWidthPageProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  titleAsides?: React.ReactNode;
}

export const FullWidthPage: React.FC<FullWidthPageProps> = ({ children, title, subtitle, titleAsides }) => {
  return (
    <EuiPage>
      <AppSidebar />
      <EuiPageBody panelled borderRadius paddingSize="l" grow={false}>
        <EuiPageHeaderSection>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiTitle size="l">
                <h1>{title}</h1>
              </EuiTitle>
              {subtitle && <EuiText color="subdued">{subtitle}</EuiText>}
            </EuiFlexItem>
            <EuiFlexItem grow={false}>{titleAsides}</EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageHeaderSection>
        <EuiPageSection>{children}</EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
};
