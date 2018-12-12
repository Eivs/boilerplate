import { Component, Children } from 'react';
import PropTypes from 'prop-types';
import storeShape from './PropTypes';

class Provider extends Component {
  static propTypes = {
    store: storeShape.isRequired,
    children: PropTypes.node,
  };

  static childContextTypes = {
    miniStore: storeShape.isRequired,
  };

  getChildContext() {
    const { store } = this.props;
    return {
      miniStore: store,
    };
  }

  render() {
    const { children } = this.props;
    return Children.only(children);
  }
}

export default Provider;
