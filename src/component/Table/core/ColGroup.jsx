import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  fixed: PropTypes.string,
};

const contextTypes = {
  table: PropTypes.any,
};

const ColGroup = (props, { table }) => {
  const { prefixCls, expandIconAsCell } = table.props;
  const { fixed } = props;

  let cols = [];

  if (expandIconAsCell && fixed !== 'right') {
    cols.push(<col className={`${prefixCls}-expand-icon-col`} key="table-expand-icon-col" />);
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
      <col key={c.key || c.dataIndex} style={{ width: c.width, minWidth: c.width }} />
    )),
  );

  return <colgroup>{cols}</colgroup>;
};

ColGroup.propTypes = propTypes;
ColGroup.contextTypes = contextTypes;

export default ColGroup;
