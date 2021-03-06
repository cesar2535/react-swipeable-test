import React from 'react';
import { Swipeable } from 'react-swipeable';
import {
  cond,
  propEq,
  inc,
  dec,
  identity,
  always,
  T,
  evolve,
  anyPass,
  ifElse,
  assoc,
  compose
} from 'ramda';
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

const isVelocityPass = ({ velocity }) => velocity > 0.5;
const isHeightPass = ({ percentageDeltaY }) => percentageDeltaY > 50;
const setPosYFromPos = state => assoc('posY', state.pos, state);
const getIndexTransformer = ifElse(
  anyPass([isVelocityPass, isHeightPass]),
  cond([
    [propEq('dir', 'Up'), always(inc)],
    [propEq('dir', 'Down'), always(dec)],
    [T, always(identity)]
  ]),
  always(identity)
);
class Slider extends React.PureComponent {
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

  componentDidMount() {
    this.setIndex(this.props.index);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.index !== prevProps.index) {
      this.setIndex(this.props.index);
    }

    if (this.state.index !== prevState.index) {
      this.updatePosition(this.state.index);
    }
  }

  updatePosition = index => {
    this.setState({ pos: index * -100, posY: index * -100 });
  };

  setIndex(index) {
    this.setState(state => ({
      index: index - state.indexStart
    }));
  }

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
    const { dir } = data;
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

    const percentageDeltaY = calculatePercentage(
      data.absY,
      this.swipeable.clientHeight
    );

    const transformer = getIndexTransformer({ ...data, percentageDeltaY });

    const transform = evolve({
      index: transformer,
      onTransition: T
    });

    const setNextState = compose(
      setPosYFromPos,
      transform
    );

    this.setState(setNextState);
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
