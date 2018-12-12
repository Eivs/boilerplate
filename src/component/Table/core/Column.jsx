import PropTypes from 'prop-types';

const propTypes = {
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

const Column = () => {};

Column.propTypes = propTypes;

export default Column;
