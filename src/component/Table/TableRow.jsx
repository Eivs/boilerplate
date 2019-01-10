import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TableCell from './TableCell';
import deepEqual from '../../utils/deepEqual';

class TableRow extends Component {
  static propTypes = {
    columns: PropTypes.array,
    record: PropTypes.object,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  };

  shouldComponentUpdate(nextProps) {
    return !deepEqual(this.props, nextProps, true);
  }

  render() {
    const { columns, record, rowKey } = this.props;
    const cells = columns.map((column, index) => {
      const { dataIndex } = column;
      const cellkey = `col-${index}-${dataIndex}`;
      const cellProps = {
        key: cellkey,
        index,
        rowKey,
        record,
        column,
      };
      return <TableCell {...cellProps} />;
    });
    return <tr>{cells}</tr>;
  }
}

export default TableRow;
