// Penner easing equations
// https://gist.github.com/gre/1650294

function linear(t) {
  return t;
}

function easeInQuad(t) {
  return Math.pow(t, 2);
}

function easeOutQuad(t) {
  return t * (2-t);
}

function easeInOutQuad(t) {
  return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeInCubic(t) {
  return t * t * t;
}

function easeOutCubic(t) {
  return (--t) * t * t + 1;
}

function easeInOutCubic(t) {
  return t < .5 ? 4 * t * t * t : (t-1) * (2*t - 2) * (2*t - 2) + 1;
}

export {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
};
