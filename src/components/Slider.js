import React from 'react';
import { Swipeable } from 'react-swipeable';
import styles from './Slider.module.scss';

const calculatePercentage = (numerator, denominator) =>
  (numerator / denominator) * 100;

class Slider extends React.Component {
  state = {
    pos: 0,
    posY: 0,
    onTransition: false
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.index !== prevProps.index) {
      this.updatePosition(this.props.index);
    }
  }

  updatePosition = index => {
    this.setState({ pos: index * -100, posY: index * -100 });
  };

  handleSwiping = data => {
    if (this.props.index === 0 && data.dir === 'Down') {
      return;
    }

    const percentageDeltaY = calculatePercentage(
      data.deltaY,
      this.swipeable.clientHeight
    );
    console.log('swiping', data);
    this.setState(state => ({ posY: state.pos - percentageDeltaY }));
  };

  handleSwiped = data => {
    const { velocity, dir } = data;
    if (this.props.index === 0 && dir === 'Down') {
      return;
    }

    this.setState(state => {
      const newState = { onTransition: true };
      const percentageDeltaY = calculatePercentage(
        data.absY,
        this.swipeable.clientHeight
      );
      if (velocity > 0.5 || percentageDeltaY > 50) {
        console.log('swiped', dir);

        if (dir === 'Up') {
          this.props.onChangeIndex(1);
        } else if (dir === 'Down') {
          this.props.onChangeIndex(-1);
        }
      }
      return { ...newState, posY: state.pos };
    });
  };

  handleTransitionEnd = () => {
    this.setState({ onTransition: false });
    this.props.onTransitionEnd();
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

    const children = React.Children.toArray(this.props.children);

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
          {children}
        </div>
      </Swipeable>
    );
  }
}

Slider.defaultProps = {
  index: 0,
  onChangeIndex: () => null,
  onTransitionEnd: () => null
};

export default Slider;
