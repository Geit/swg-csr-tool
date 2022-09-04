import { EuiCard } from '@elastic/eui';
import React from 'react';
import { Link } from 'react-router-dom';

export const SearchResultCard: React.FC<{
  children: React.ReactNode;
  title: NonNullable<React.ReactNode>;
  href: string;
}> = ({ children, title, href }) => {
  return (
    <Link to={href} rel="noreferrer" className="searchResultCard">
      <EuiCard title={title} display="plain" hasBorder onClick={() => {}} textAlign="left">
        {children}
      </EuiCard>
    </Link>
  );
};
