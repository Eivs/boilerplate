import { Component } from 'react';
import PropTypes from 'prop-types';

class Content extends Component {
  static propTypes = {
    children: PropTypes.node,
    text: PropTypes.string,
  };

  shouldComponentUpdate(nextProps) {
    const { children } = this.props;
    return children !== nextProps.children;
  }

  render() {
    const { children, text } = this.props;
    return children(text);
  }
}

export default Content;
