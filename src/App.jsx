import React, { createContext, memo } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext({
  background: 'red',
  color: 'white',
  text: '',
});

const title = props => (
  <ThemeContext.Consumer>
    {context => (
      <h1 style={{ background: context.background, color: context.color }}>{props.children}</h1>
    )}
  </ThemeContext.Consumer>
);

title.propTypes = {
  children: PropTypes.node.isRequired,
};

const Title = memo(title);

const Input = props => <input type="text" {...props} />;

const Header = memo(() => (
  <>
    <Title>Hello React Context API</Title>
    <Input />
  </>
));

const App = () => (
  <ThemeContext.Provider value={{ background: 'green', color: 'white' }}>
    <Header />
  </ThemeContext.Provider>
);

export default App;
