import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { actions } from '../store';

const Todo = memo(({ completed, id, text }) => (
  <li
    style={{
      textDecoration: completed ? 'line-through' : 'none',
    }}
    onClick={() => actions.toggle(id)}
  >
    {text}
  </li>
));

Todo.propTypes = {
  completed: PropTypes.bool,
  id: PropTypes.string,
  text: PropTypes.string,
};

export default Todo;
