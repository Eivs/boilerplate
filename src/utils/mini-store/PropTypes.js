import PropTypes from 'prop-types';

const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired,
});

export default storeShape;
