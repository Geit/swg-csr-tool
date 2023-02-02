import { useHistory, useLocation } from 'react-router-dom';
import { QueryParamAdapter, QueryParamAdapterComponent } from 'use-query-params';

/**
 * Query Param Adapter for react-router v5
 */
export const ReactRouter5Adapter: QueryParamAdapterComponent = ({ children }) => {
  // Unused, but provides rerenders
  useLocation();

  const history = useHistory();

  const adapter: QueryParamAdapter = {
    replace(newLoc) {
      history.replace(newLoc, newLoc.state);
    },
    push(newLoc) {
      history.push(newLoc, newLoc.state);
    },
    get location() {
      return history.location;
    },
  };

  return children(adapter);
};
