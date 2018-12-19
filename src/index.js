import React from 'react';
import { render } from 'react-dom';
// import whyDidYouUpdate from 'why-did-you-update';
import './lego-ui.min.css';

// if (process.env.NODE_ENV !== 'production') {
//   whyDidYouUpdate(React);
// }

// eslint-disable-next-line import/first
import App from './App';


/* eslint-disable react/jsx-filename-extension */
render(<App />, document.getElementById('root'));

module.hot.accept();
