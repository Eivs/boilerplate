/* eslint-disable react/no-unused-prop-types */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';

class Column extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    colSpan: PropTypes.number,
    title: PropTypes.node,
    dataIndex: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fixed: PropTypes.oneOf([true, 'left', 'right']),
    render: PropTypes.func,
    onCellClick: PropTypes.func,
    onCell: PropTypes.func,
    onHeaderCell: PropTypes.func,
  };
}

export default Column;
