import React, { Component } from 'react';
import RenderProps from './RenderProps';

class Demo extends Component {
  state = {
    text1: 'haha',
    text2: 'hehe',
  };

  renderFunc1 = () => {
    const { text1 } = this.state;
    console.log('renderFunc1');
    return <h1>{text1}</h1>;
  };

  renderFunc2 = () => {
    const { text2 } = this.state;
    console.log('renderFunc2');
    return <h2>{text2}</h2>;
  };

  onChange1 = e => {
    const { value } = e.currentTarget;
    this.setState({ text1: value });
  };

  onChange2 = e => {
    const { value } = e.currentTarget;
    this.setState({ text2: value });
  };

  render() {
    const { text1, text2 } = this.state;

    return (
      <div>
        <input
          type="text"
          value={text1}
          onChange={this.onChange1}
        />
        <input
          type="text"
          value={text2}
          onChange={this.onChange2}
        />
        <RenderProps
          text={text1}
          render={text => (
            <h1>
              {text}
              {text2}
            </h1>
          )}
        />
        <RenderProps
          text={text2}
          render={text => (
            <h2>
              {text}
              {text1}
            </h2>
          )}
        />
      </div>
    );
  }
}

export default Demo;
