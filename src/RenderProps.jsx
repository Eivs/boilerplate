/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { onlyUpdateForKeys } from 'recompose';
// import shallowEqual from './utils/shallowEqual';
// import { shallowEqual } from './useShallowEqual';
// import Content from './Content';

class RenderProps extends Component {
  static propTypes = {
    render: PropTypes.func,
    text: PropTypes.string,
  };

  shouldComponentUpdate(nextProps) {
    const { text } = this.props;
    return text !== nextProps.text;
  }

  render() {
    const { render, text } = this.props;
    return <div>{render(text)}</div>;
  }
}

export default RenderProps;
