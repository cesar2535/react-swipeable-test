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

const getChildrenBounding = props => {
  const start = getBoundingStart(props);
  const end = getBoundingEnd(props);
  return [start, end];
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
    const [beforeLen, afterLen] = getChildrenBounding(nextProps);
    const indexStart = nextProps.index - beforeLen;
    const indexEnd = nextProps.index + afterLen;

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

  componentDidUpdate(prevProps, prevState) {
    if (this.props.index !== prevProps.index) {
      const { indexStart } = this.state;
      const nextStateIdx = this.props.index - indexStart;
      this.setState({ index: nextStateIdx });
    }

    if (this.state.index !== prevState.index) {
      this.updatePosition(this.state.index);
    }
  }

  updatePosition = index => {
    this.setState({ pos: index * -100, posY: index * -100 });
  };

  handleSwiping = data => {
    this.props.onSwitching(true);

    if (this.state.index === 0 && data.dir === 'Down') {
      return;
    }

    if (
      this.state.index === this.state.indexEnd - this.state.indexStart - 1 &&
      data.dir === 'Up'
    ) {
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
    this.props.onSwitching(false);

    if (this.state.index === 0 && dir === 'Down') {
      return this.setState(state => ({ posY: state.pos }));
    }

    if (
      this.state.index === this.state.indexEnd - this.state.indexStart - 1 &&
      dir === 'Up'
    ) {
      return this.setState(state => ({ posY: state.pos }));
    }

    this.setState(state => {
      let nextIdx = state.index;
      const newState = { onTransition: true };
      const percentageDeltaY = calculatePercentage(
        data.absY,
        this.swipeable.clientHeight
      );
      if (velocity > 0.5 || percentageDeltaY > 50) {
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
    this.setState({ onTransition: false });
    this.props.onTransitionEnd();
    this.props.onChangeIndex(indexStart + index);
  };

  getContainerStyle(posY, hasTransition = false) {
    const transform = `translate(0, ${posY}%)`;

    if (hasTransition) {
      return {
        transform,
        transition: `transform 0.3s cubic-bezier(0.15, 0.3, 0.25, 1)`
      };
    }

    return { transform };
  }

  render() {
    const { posY, onTransition, indexStart, indexEnd } = this.state;
    const style = this.getContainerStyle(posY, onTransition);

    const children = React.Children.toArray(this.props.children);
    const list = children.slice(indexStart, indexEnd);

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
  onSwitching: () => null,
  onChangeIndex: () => null,
  onTransitionEnd: () => null
};

export default Slider;
