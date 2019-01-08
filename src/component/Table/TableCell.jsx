import React, { memo } from 'react';
import PropTypes from 'prop-types';

const Cell = ({ column, record, rowKey, index }) => {
  const { render, dataIndex } = column;
  const res = record[dataIndex];

  if (render) {
    return <td>{render(res, index, rowKey)}</td>;
  }
  return <td>{res}</td>;
};

Cell.propTypes = {
  column: PropTypes.object,
  record: PropTypes.object,
  rowKey: PropTypes.string,
  index: PropTypes.number,
};

export default memo(Cell);
