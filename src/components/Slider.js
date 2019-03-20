import React from 'react';
import { Swipeable } from 'react-swipeable';
import styles from './Slider.module.scss';

import Card from './Card';

const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

class Slider extends React.Component {
  state = {
    pos: 0,
    posY: 0,
    onTransition: false
  };

  handleSwiping = data => {
    const percentageDeltaY = (data.deltaY / this.swipeable.clientHeight) * 100;
    console.log('swiping', data);
    this.setState(state => ({ posY: state.pos - percentageDeltaY }));
  };

  handleSwiped = data => {
    const { velocity, dir } = data;
    this.setState(state => {
      const newState = { onTransition: true };
      if (velocity > 0.5) {
        console.log('swiped', dir);
        if (dir === 'Up') {
          const pos = state.pos - 100;
          return {
            ...newState,
            pos,
            posY: pos
          };
        } else if (dir === 'Down') {
          const pos = state.pos + 100;
          return {
            ...newState,
            pos,
            posY: pos
          };
        }
      } else {
        return { ...newState, posY: state.pos };
      }
    });
  };

  handleTransitionEnd = () => {
    this.setState({ onTransition: false });
  };

  renderItem = (val, idx) => {
    return <Card key={idx} id={idx} />;
  };

  render() {
    const { posY, onTransition } = this.state;
    let style = {};

    if (onTransition) {
      style = {
        transform: `translate(0, ${posY}%)`,
        transition: `transform 0.3s cubic-bezier(0.15, 0.3, 0.25, 1)`
      };
    } else {
      style = {
        transform: `translate(0, ${posY}%)`
      };
    }

    return (
      <Swipeable
        innerRef={ref => (this.swipeable = ref)}
        className={styles['base']}
        onSwiped={this.handleSwiped}
        onSwiping={this.handleSwiping}
      >
        <div
          className={styles['slider-container']}
          style={style}
          onTransitionEnd={this.handleTransitionEnd}
        >
          {data.map(this.renderItem)}
        </div>
      </Swipeable>
    );
  }
}

export default Slider;
