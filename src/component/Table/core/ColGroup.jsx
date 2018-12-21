import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deepEqual from '../../../utils/deepEqual';

class ColGroup extends Component {
  static propTypes = {
    fixed: PropTypes.string,
  };

  static contextTypes = {
    table: PropTypes.any,
  };

  shouldComponentUpdate(nextProps) {
    return !deepEqual(this.props, nextProps);
  }

  render() {
    const { table } = this.context;
    const { prefixCls, expandIconAsCell } = table.props;
    const { fixed } = this.props;

    let cols = [];

    if (expandIconAsCell && fixed !== 'right') {
      cols.push(<col
        className={`${prefixCls}-expand-icon-col`}
        key="table-expand-icon-col"
      />);
    }

    let leafColumns;

    if (fixed === 'left') {
      leafColumns = table.columnManager.leftLeafColumns();
    } else if (fixed === 'right') {
      leafColumns = table.columnManager.rightLeafColumns();
    } else {
      leafColumns = table.columnManager.leafColumns();
    }

    cols = cols.concat(
      leafColumns.map(c => (
        <col
          key={c.key || c.dataIndex}
          style={{ width: c.width, minWidth: c.width }}
        />
      )),
    );

    return <colgroup>{cols}</colgroup>;
  }
}

export default ColGroup;
