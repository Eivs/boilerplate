/* eslint-disable react/prop-types */
import React from 'react';
import { connect, Provider, actions } from './store';

const Info = ({ children }) => <div>{children}</div>;
let Count = ({ count }) => <Info>{count}</Info>;

Count = connect(({ count }) => ({ count }))(Count);

const App = () => (
  <Provider>
    <Count />
    <br />
    <button type="button" onClick={actions.increment}>
      +
    </button>
  </Provider>
);

export default App;
