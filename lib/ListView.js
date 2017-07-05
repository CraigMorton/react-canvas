'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Scroller from 'scroller';
import Group from './Group';
import clamp from './clamp';

class ListView extends Component {
  static propTypes = {
    style: PropTypes.object,
    numberOfItemsGetter: PropTypes.func.isRequired,
    itemHeightGetter: PropTypes.func.isRequired,
    itemGetter: PropTypes.func.isRequired,
    snapping: PropTypes.bool,
    scrollingDeceleration: PropTypes.number,
    scrollingPenetrationAcceleration: PropTypes.number,
    onScroll: PropTypes.func
  };

  static defaultProps = {
    style: { left: 0, top: 0, width: 0, height: 0 },
    snapping: false,
    scrollingDeceleration: 0.95,
    scrollingPenetrationAcceleration: 0.08
  };

  state = {
    scrollTop: 0
  };

  componentDidMount() {
    this.createScroller();
    this.updateScrollingDimensions();
  }

  render() {
    var items = this.getVisibleItemIndexes().map(this.renderItem);
    return (
      React.createElement(Group, {
        style: this.props.style,
        onTouchStart: this.handleTouchStart,
        onTouchMove: this.handleTouchMove,
        onTouchEnd: this.handleTouchEnd,
        onTouchCancel: this.handleTouchEnd},
        items
      )
    );
  }

  renderItem = (itemIndex) => {
    var item = this.props.itemGetter(itemIndex, this.state.scrollTop);
    var itemHeight = this.props.itemHeightGetter();
    var style = {
      top: 0,
      left: 0,
      width: this.props.style.width,
      height: itemHeight,
      translateY: (itemIndex * itemHeight) - this.state.scrollTop,
      zIndex: itemIndex
    };

    return (
      React.createElement(Group, {style: style, key: itemIndex},
        item
      )
    );
  };

  // Events
  // ======

  handleTouchStart = (e) => {
    if (this.scroller) {
      this.scroller.doTouchStart(e.touches, e.timeStamp);
    }
  };

  handleTouchMove = (e) => {
    if (this.scroller) {
      e.preventDefault();
      this.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
    }
  };

  handleTouchEnd = (e) => {
    if (this.scroller) {
      this.scroller.doTouchEnd(e.timeStamp);
      if (this.props.snapping) {
        this.updateScrollingDeceleration();
      }
    }
  };

  handleScroll = (left, top) => {
    this.setState({ scrollTop: top });
    if (this.props.onScroll) {
      this.props.onScroll(top);
    }
  };

  // Scrolling
  // =========

  createScroller = () => {
    var options = {
      scrollingX: false,
      scrollingY: true,
      decelerationRate: this.props.scrollingDeceleration,
      penetrationAcceleration: this.props.scrollingPenetrationAcceleration,
    };
    this.scroller = new Scroller(this.handleScroll, options);
  };

  updateScrollingDimensions = () => {
    var width = this.props.style.width;
    var height = this.props.style.height;
    var scrollWidth = width;
    var scrollHeight = this.props.numberOfItemsGetter() * this.props.itemHeightGetter();
    this.scroller.setDimensions(width, height, scrollWidth, scrollHeight);
  };

  getVisibleItemIndexes = () => {
    var itemIndexes = [];
    var itemHeight = this.props.itemHeightGetter();
    var itemCount = this.props.numberOfItemsGetter();
    var scrollTop = this.state.scrollTop;
    var itemScrollTop = 0;

    for (var index=0; index < itemCount; index++) {
      itemScrollTop = (index * itemHeight) - scrollTop;

      // Item is completely off-screen bottom
      if (itemScrollTop >= this.props.style.height) {
        continue;
      }

      // Item is completely off-screen top
      if (itemScrollTop <= -this.props.style.height) {
        continue;
      }

      // Part of item is on-screen.
      itemIndexes.push(index);
    }

    return itemIndexes;
  };

  updateScrollingDeceleration = () => {
    var currVelocity = this.scroller.__decelerationVelocityY;
    var currScrollTop = this.state.scrollTop;
    var targetScrollTop = 0;
    var estimatedEndScrollTop = currScrollTop;

    while (Math.abs(currVelocity).toFixed(6) > 0) {
      estimatedEndScrollTop += currVelocity;
      currVelocity *= this.props.scrollingDeceleration;
    }

    // Find the page whose estimated end scrollTop is closest to 0.
    var closestZeroDelta = Infinity;
    var pageHeight = this.props.itemHeightGetter();
    var pageCount = this.props.numberOfItemsGetter();
    var pageScrollTop;

    for (var pageIndex=0, len=pageCount; pageIndex < len; pageIndex++) {
      pageScrollTop = (pageHeight * pageIndex) - estimatedEndScrollTop;
      if (Math.abs(pageScrollTop) < closestZeroDelta) {
        closestZeroDelta = Math.abs(pageScrollTop);
        targetScrollTop = pageHeight * pageIndex;
      }
    }

    this.scroller.__minDecelerationScrollTop = targetScrollTop;
    this.scroller.__maxDecelerationScrollTop = targetScrollTop;
  };
}

export default ListView;
