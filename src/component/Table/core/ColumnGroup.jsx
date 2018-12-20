/* eslint-disable react/no-unused-prop-types */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';

class ColumnGroup extends PureComponent {
  static isTableColumnGroup = true;

  static propTypes = {
    title: PropTypes.node,
  };
}

export default ColumnGroup;
