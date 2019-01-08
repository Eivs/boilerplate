import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const createProvider = (setProvider, Provider, initialState) =>
  class EnhancedProvider extends PureComponent {
    static propTypes = {
      children: PropTypes.node,
      initialState: PropTypes.object,
    };

    constructor(props) {
      super(props);
      this.state = props.initialState || initialState;
      setProvider(this);
    }

    render() {
      const { children } = this.props;
      return <Provider value={this.state}>{children}</Provider>;
    }
  };

export default createProvider;
