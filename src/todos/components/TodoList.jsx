import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { connect } from '../store';
import Todo from './Todo';

const TodoList = memo(({ todos, visibilityFilter }) => (
  <ul>
    {todos
      .filter(todo => {
        if (visibilityFilter === 'all') {
          return true;
        }
        if (visibilityFilter === 'completed') {
          return todo.completed;
        }
        return !todo.completed;
      })
      .map(props => (
        <Todo {...props} key={props.id} />
      ))}
  </ul>
));

TodoList.propTypes = {
  id: PropTypes.string,
  todos: PropTypes.array,
  visibilityFilter: PropTypes.string,
};

export default connect(state => state)(TodoList);
