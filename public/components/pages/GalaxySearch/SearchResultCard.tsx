import React from 'react';
import { Link } from 'react-router-dom';

export const SearchResultCard: React.FC<{ children: React.ReactNode; title: React.ReactNode; href: string }> = ({
  children,
  title,
  href,
}) => {
  return (
    <Link
      to={href}
      rel="noreferrer"
      className="euiPanel euiPanel--paddingMedium euiPanel--borderRadiusMedium euiPanel--plain euiPanel--hasShadow euiPanel--hasBorder euiPanel--isClickable euiCard euiCard--leftAligned euiCard--isClickable searchResultCard"
    >
      <div className="euiCard__content">
        <span className="euiTitle euiTitle--small euiCard__title">
          <a className="euiCard__titleAnchor" aria-describedby="">
            {title}
          </a>
        </span>
        <div className="euiCard__children">{children}</div>
      </div>
    </Link>
  );
};
