import PropTypes from 'prop-types';

const propTypes = {
  title: PropTypes.node,
};

const ColumnGroup = () => {};

ColumnGroup.isTableColumnGroup = true;
ColumnGroup.propTypes = propTypes;

export default ColumnGroup;
