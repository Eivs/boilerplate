/* eslint-disable react/no-multi-comp */
import React, { memo } from 'react';
import Prevent from './Prevent';

const connect = Consumer => mapStateToProps => WrappedComponent => {
  const renderComponent = props => <WrappedComponent {...props} />;

  const ConnectedComponent = props => (
    <Consumer>
      {state => {
        const filteredState = mapStateToProps(state || {}, props);
        return (
          <Prevent
            renderComponent={renderComponent}
            {...props}
            {...filteredState}
          />
        );
      }}
    </Consumer>
  );

  ConnectedComponent.displayName = `Connect(${WrappedComponent.displayName
    || WrappedComponent.name
    || 'Unknown'})`;

  return memo(ConnectedComponent);
};

export default connect;
