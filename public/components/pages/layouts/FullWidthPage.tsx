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
  pageContentProps?: any;
  grow?: boolean;
}

export const FullWidthPage: React.FC<FullWidthPageProps> = ({
  children,
  title,
  subtitle,
  titleAsides,
  pageContentProps,
  grow = false,
}) => {
  return (
    <EuiPage>
      <AppSidebar />
      <EuiPageBody panelled borderRadius paddingSize="l" grow={grow}>
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
        <EuiSpacer />
        <EuiPageSection paddingSize="none" grow={grow} contentProps={pageContentProps}>
          {children}
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
};
