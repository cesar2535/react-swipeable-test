import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Card from '../components/Card';
import Slider from '../components/Slider';

const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

class App extends Component {
  state = {
    index: 0
  };

  handleChange = delta => {
    this.setState(state => ({ index: state.index + delta }));
  };

  renderCard = (val, idx) => {
    return <Card key={idx} id={idx} />;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <Slider index={this.state.index} onChangeIndex={this.handleChange}>
            {data.map(this.renderCard)}
          </Slider>
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
