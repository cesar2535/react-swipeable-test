import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Slider from '../components/Slider';

class App extends Component {
  state = {
    index: 0
  };

  handleChange = delta => {
    this.setState(state => ({ index: state.index + delta }));
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <Slider index={this.state.index} onChangeIndex={this.handleChange} />
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
