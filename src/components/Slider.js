import React from 'react';
import { Swipeable } from 'react-swipeable';
import styles from './Slider.module.scss';

import Card from './Card';

const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

class Slider extends React.Component {
  state = {
    posY: 0
  };

  handleSwiping = data => {
    const percentageDeltaY = (data.deltaY / this.swipeable.clientHeight) * 100;
    console.log('swiping', data);
    this.setState(state => ({ posY: -percentageDeltaY }));
  };

  handleSwiped = data => {
    const { velocity, dir } = data;
    if (velocity > 0.5) {
      console.log('swiped', dir);
    }
  };

  renderItem = (val, idx) => {
    return <Card key={idx} id={idx} />;
  };

  render() {
    const { posY } = this.state;
    const style = {
      transform: `translate(0, ${posY}%)`
    };

    return (
      <Swipeable
        innerRef={ref => (this.swipeable = ref)}
        className={styles['base']}
        onSwiped={this.handleSwiped}
        onSwiping={this.handleSwiping}
      >
        <div className={styles['slider-container']} style={style}>
          {data.map(this.renderItem)}
        </div>
      </Swipeable>
    );
  }
}

export default Slider;
