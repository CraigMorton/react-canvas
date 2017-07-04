'use strict';

import createComponent from './createComponent';
import LayerMixin from './LayerMixin';

var Layer = createComponent('Layer', LayerMixin, {

  mountComponent: function (
    transaction,
    nativeParent,
    nativeContainerInfo,
    context
  ) {
    var props = this._currentElement.props;
    var layer = this.node;
    this.applyLayerProps({}, props);
    return layer;
  },

  receiveComponent: function (nextComponent, transaction, context) {
    var prevProps = this._currentElement.props;
    var props = nextComponent.props;
    this.applyLayerProps(prevProps, props);
    this._currentElement = nextComponent;
    this.node.invalidateLayout();
  }

});

export default Layer;
