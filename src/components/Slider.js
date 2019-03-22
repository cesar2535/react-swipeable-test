import React from 'react';
import { Swipeable } from 'react-swipeable';
import styles from './Slider.module.scss';

const calculatePercentage = (numerator, denominator) =>
  (numerator / denominator) * 100;

const getBoundingStart = props => {
  const { index, before } = props;
  let start = before;

  while (start > index) {
    start = start - 1;
  }

  return start;
};

const getBoundingEnd = props => {
  const { index, after, children } = props;
  const len = React.Children.count(children);
  let end = after;

  while (index + end > len) {
    end--;
  }

  return end;
};

class Slider extends React.Component {
  state = {
    pos: 0,
    posY: 0,
    index: 0,
    indexStart: 0,
    indexEnd: 0,
    onTransition: false
  };

  // これは static method のため、メソッド内で this.props.hoge !== nextProps.hoge のような比較処理は行えません。
  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = Object.assign({}, prevState);
    const beforeLen = getBoundingStart(nextProps);
    const afterLen = getBoundingEnd(nextProps);
    const indexStart = nextProps.index - beforeLen;
    const indexEnd = nextProps.index + afterLen;

    console.log(nextState);
    if (
      prevState.indexStart !== indexStart ||
      prevState.indexEnd !== indexEnd
    ) {
      return {
        indexStart,
        indexEnd
      };
    }

    return null;
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.state.index !== prevState.index) {
      console.log('update position', this.state.index);
      this.updatePosition(this.state.index);
    }
  }

  updatePosition = index => {
    this.setState({ pos: index * -100, posY: index * -100 });
  };

  handleSwiping = data => {
    if (this.state.index === 0 && data.dir === 'Down') {
      return;
    }

    const percentageDeltaY = calculatePercentage(
      data.deltaY,
      this.swipeable.clientHeight
    );

    this.setState(state => ({ posY: state.pos - percentageDeltaY }));
  };

  handleSwiped = data => {
    const { velocity, dir } = data;
    if (this.state.index === 0 && dir === 'Down') {
      return;
    }

    this.setState(state => {
      let nextIdx = state.index;
      const newState = { onTransition: true };
      const percentageDeltaY = calculatePercentage(
        data.absY,
        this.swipeable.clientHeight
      );
      if (velocity > 0.5 || percentageDeltaY > 50) {
        console.log('swiped', dir);

        if (dir === 'Up') {
          nextIdx = state.index + 1;
        } else if (dir === 'Down') {
          nextIdx = state.index - 1;
        }
      }
      return { ...newState, posY: state.pos, index: nextIdx };
    });
  };

  handleTransitionEnd = () => {
    const { index, indexStart } = this.state;
    console.log('onTransitionEnd propsIndex', this.props.index);
    console.log('onTransitionEnd indexStart', indexStart);
    console.log('onTransitionEnd stateIndex', index);
    this.setState({ onTransition: false });
    this.props.onTransitionEnd();
    this.props.onChangeIndex(indexStart + index);
  };

  render() {
    const { posY, onTransition, indexStart, indexEnd } = this.state;
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
    const list = children.slice(indexStart, indexEnd);
    console.log('props index @render', this.props.index);
    console.log(indexStart, indexEnd);

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
          {list}
        </div>
      </Swipeable>
    );
  }
}

Slider.defaultProps = {
  index: 0,
  before: 2,
  after: 3,
  onChangeIndex: () => null,
  onTransitionEnd: () => null
};

export default Slider;
