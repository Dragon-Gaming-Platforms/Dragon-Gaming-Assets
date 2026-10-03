/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./app/Animation.ts":
/*!**************************!*\
  !*** ./app/Animation.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Animation)
/* harmony export */ });
/* harmony import */ var _libs_math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./libs/math */ "./app/libs/math.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config */ "./app/config.ts");
/* harmony import */ var _libs_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./libs/utils */ "./app/libs/utils.ts");





class Animation {

  constructor(animationData, pos = new _libs_math__WEBPACK_IMPORTED_MODULE_0__.Vec2(0, 0)) {
    this.frames = animationData.frames.map(frame => (0,_libs_utils__WEBPACK_IMPORTED_MODULE_2__.castArray)(frame));
    this.framesNames = animationData.framesNames;
    this.frameTime = animationData.frameTime / 1000;
    this.framesCount = this.frames.length;
    this.visible = true;
    this.pos = pos.clone();
    this.transformIndex = 0;
    this.onAnimationEndListeners = new Set();
  }

  playInLoop() {
    this.play(true);
  }

  play(loop = false) {
    this.loop = loop;
    this.ended = false;
    this.frameIndex = 0;
    this.elapsedTime = 0;
    this.show();
  }

  stop() {
    this.loop = false;
    this.ended = true;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  getFrameName(frameIndex) {
    return this.framesNames[frameIndex];
  }

  getLastFrameName() {
    return this.getFrameName(this.framesCount - 1);
  }

  triggerOnAnimationEnd() {
    this.onAnimationEndListeners.forEach(listener => listener(this));
  }

  render(context, deltaTime) {
    if(this.loop || this.frameIndex + 1 < this.framesCount) {
      this.frameIndex = Math.floor(this.elapsedTime / this.frameTime) % this.framesCount;
      this.elapsedTime += deltaTime;
    } else if(!this.ended) {
      this.ended = true;
      this.triggerOnAnimationEnd();
    }

    if(!this.visible) return;

    const frame = this.frames[this.frameIndex || 0];
    context.drawImage(
      frame[this.transformIndex],
      this.pos.x * _config__WEBPACK_IMPORTED_MODULE_1__["default"].grid.size,
      this.pos.y * _config__WEBPACK_IMPORTED_MODULE_1__["default"].grid.size
    );
  }
}


/***/ }),

/***/ "./app/Background.ts":
/*!***************************!*\
  !*** ./app/Background.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Background)
/* harmony export */ });
/* harmony import */ var _libs_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./libs/utils */ "./app/libs/utils.ts");


class Background {
  constructor(images) {
    this.images = (0,_libs_utils__WEBPACK_IMPORTED_MODULE_0__.castArray)(images);
  }

  render(context) {
    context.drawImage(this.images[0], 0, 0);
  }
}


/***/ }),

/***/ "./app/BackgroundMap.ts":
/*!******************************!*\
  !*** ./app/BackgroundMap.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BackgroundMap)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config.js */ "./app/config.ts");
/* harmony import */ var _libs_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./libs/utils */ "./app/libs/utils.ts");
/* harmony import */ var _libs_math__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./libs/math */ "./app/libs/math.ts");
/* harmony import */ var _Animation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Animation */ "./app/Animation.ts");
/* harmony import */ var _Background__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Background */ "./app/Background.ts");
/* harmony import */ var _Range__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Range */ "./app/Range.ts");









class BackgroundMap {

  constructor(backgroundsSpec, tilesMap) {
    this.size = new _libs_math__WEBPACK_IMPORTED_MODULE_2__.Vec2(_config_js__WEBPACK_IMPORTED_MODULE_0__["default"].screen.width, _config_js__WEBPACK_IMPORTED_MODULE_0__["default"].screen.height);
    this.backgroundImages = new Map();
    this.animationsData = new Map();
    backgroundsSpec.backgrounds.forEach(bgSpec => this._createBackground(bgSpec, tilesMap));
    backgroundsSpec.animations.forEach(animSpec => this._createAnimationData(animSpec));
  }

  get(bgName) {
    return new _Background__WEBPACK_IMPORTED_MODULE_4__["default"](this.backgroundImages.get(bgName));
  }

  getNewAnimation(animName) {
    const animationData = this.animationsData.get(animName);
    return new _Animation__WEBPACK_IMPORTED_MODULE_3__["default"](animationData);
  }

  _createAnimationData(animSpec) {
    const frames = animSpec.frames.map(bgName => this.backgroundImages.get(bgName));
    this.animationsData.set(animSpec.name, {
      frames,
      frameTime: animSpec.frameTime
    });
  }

  _createBackground(bgSpec, tilesMap) {
    // Buffer initialize
    const buffer = document.createElement('canvas');
    buffer.width = this.size.x;
    buffer.height = this.size.y;

    // Fill buffer with defined color
    const context = buffer.getContext('2d');
    this._fillBuffer(context, bgSpec.color);

    // Draw tilesMap into the buffer
    bgSpec.fill.forEach(this._drawToBuffer(context, tilesMap));

    // Save backgrounds
    this.backgroundImages.set(bgSpec.name, buffer);
  }

  _fillBuffer(context, color) {
    if (color) {
      context.fillStyle = color;
      context.fillRect(0, 0, this.size.x, this.size.y);
    } else {
      context.fillStyle = 'rgba(0, 0, 0, 1)';
    }
  }

  _drawToBuffer(context, tilesMap) {
    function normalizeRange(fn) {
      return range => {
        range = Array.isArray(range) ? range : [range, range];
        fn(new _Range__WEBPACK_IMPORTED_MODULE_5__["default"](range[0], range[1]));
      };
    }

    function drawTile(rangeX, rangeY, { step, names, nameIndex, index }) {
      rangeX.forEach(x => {
        rangeY.forEach(y => {
          let spriteName = names[nameIndex++ % names.length];
          tilesMap.draw(spriteName, context, new _libs_math__WEBPACK_IMPORTED_MODULE_2__.Vec2(x, y), index || 0);
        }, step.y);
      }, step.x);
    }

    return fillSpec => {
      const fillCxt = {
        names: (0,_libs_utils__WEBPACK_IMPORTED_MODULE_1__.castArray)(fillSpec.spriteName),
        nameIndex: 0,
        index: fillSpec.index
      };

      // Process ranges
      fillSpec.ranges.forEach(range => {
        fillCxt.step = new _libs_math__WEBPACK_IMPORTED_MODULE_2__.Vec2(range.stepX || 1, range.stepY || 1);
        // Process X range
        range.x.forEach(
          normalizeRange(rangeX => {
            // Process Y range
            range.y.forEach(
              normalizeRange(rangeY => {
                drawTile(rangeX, rangeY, fillCxt);
              })
            );
          })
        );
      });
    };
  }
}


/***/ }),

/***/ "./app/Behavior.ts":
/*!*************************!*\
  !*** ./app/Behavior.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Behavior)
/* harmony export */ });

class Behavior {

  constructor(name) {
    this.name = name;
    this.onStartListeners = new Set();
    this.onEndListeners = new Set();
  }

  triggerOnStart(data) {
    this.onStartListeners.forEach(handler => handler(data));
  }

  triggerOnEnd(data) {
    this.onEndListeners.forEach(handler => handler(data));
  }

  update(entity, deltaTime) {
    console.info('Update not implemented!');
  }
}


/***/ }),

/***/ "./app/Block.ts":
/*!**********************!*\
  !*** ./app/Block.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Block)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./app/config.ts");
/* harmony import */ var _behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./behaviors/Jump */ "./app/behaviors/Jump.ts");
/* harmony import */ var _libs_math__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./libs/math */ "./app/libs/math.ts");





const blockSize = 3 * _config__WEBPACK_IMPORTED_MODULE_0__["default"].grid.size;

class Block {
  constructor(initialSpriteName, tilesMap, pos = new _libs_math__WEBPACK_IMPORTED_MODULE_2__.Vec2(0, 0)) {
    this.currentSpriteName = initialSpriteName;
    this.tilesMap = tilesMap;
    this.pos = pos.clone();
    this.onRotateEndHandlers = new Set();
    this.cleared = false;
    this._initializeAnimations();
  }

  addRotateEndHandler(handler) {
    this.onRotateEndHandlers.add(handler);
  }

  triggerOnRotateEndHandler() {
    this.onRotateEndHandlers.forEach(handler => handler(this));
  }

  markAsCleared() {
    this.cleared = true;
    this.currentBlockAnim = this.tilesMap.newSprite("bl-cleared", this.pos);
  }

  rotate(direction) {
    if(this.cleared) return;
    this.currentBlockAnim = this.blockAnimMap.get(`${this.currentSpriteName}-${direction.y}-${direction.x}`);
    this.currentBlockAnim.pos.set(this.pos.x, this.pos.y);
    this.currentSpriteName = this.currentBlockAnim.getLastFrameName();
    this.currentBlockAnim.play();
  }

  render(context, deltaTime) {
    context.clearRect(
      this.pos.x * _config__WEBPACK_IMPORTED_MODULE_0__["default"].grid.size,
      this.pos.y * _config__WEBPACK_IMPORTED_MODULE_0__["default"].grid.size,
      blockSize,
      blockSize
    );

    if(this.currentBlockAnim) {
      this.currentBlockAnim.render(context, deltaTime);
    }
  }

  _initializeAnimations() {
    let blocksSpec = [
      [`bl1-f-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.UP}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.RIGHT}`  , 'bl1-f-u'],
      [`bl1-f-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.DOWN}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.LEFT}` , 'bl1-f-d'],
      [`bl1-f-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.UP}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.LEFT}`   , 'bl1-f-l'],
      [`bl1-f-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.DOWN}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.RIGHT}`, 'bl1-f-r'],

      [`bl1-r-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.UP}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.RIGHT}`  , 'bl1-r-u'],
      [`bl1-r-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.DOWN}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.LEFT}` , 'bl1-r-d'],
      [`bl1-r-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.UP}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.LEFT}`   , 'bl1-r-l'],
      [`bl1-r-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.DOWN}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.RIGHT}`, 'bl1-r-r'],

      [`bl1-t-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.UP}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.RIGHT}`  , 'bl1-t-u'],
      [`bl1-t-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.DOWN}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.LEFT}` , 'bl1-t-d'],
      [`bl1-t-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.UP}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.LEFT}`   , 'bl1-t-l'],
      [`bl1-t-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.DOWN}-${_behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__.RIGHT}`, 'bl1-t-r'],
    ];

    this.blockAnimMap = new Map();
    blocksSpec.forEach(blockSpec => {
      let blockAnim = this.tilesMap.newAnimation(blockSpec[1]);
      blockAnim.onAnimationEndListeners.add(() => {
        this.triggerOnRotateEndHandler();
      });
      this.blockAnimMap.set(blockSpec[0], blockAnim);
    });
  }
}


/***/ }),

/***/ "./app/Compositor.ts":
/*!***************************!*\
  !*** ./app/Compositor.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Compositor)
/* harmony export */ });
class Compositor {
  constructor() {
    this.updatableLayers = [];
    this.layers = [];
  }

  addLayer(layer) {
    if(layer.update) this.updatableLayers.push(layer);
    this.layers.push(layer);
  }

  update(time) {
    this.updatableLayers.forEach(layer => layer.update(time));
  }

  render(context, time) {
    this.layers.forEach(layer => layer.render(context, time));
  }
}


/***/ }),

/***/ "./app/Entity.ts":
/*!***********************!*\
  !*** ./app/Entity.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Entity)
/* harmony export */ });

class Entity {

  constructor(pos) {
    this.behaviors = [];
    this.transformIndex = 0;
    this.pos = pos.clone();
  }

  addBehavior(behavior) {
    this.behaviors.push(behavior);
    this[behavior.name] = behavior;
  }

  update(deltaTime) {
    this.behaviors.forEach(behavior => behavior.update(this, deltaTime));
    if(this.sprite)
      this.sprite.pos.set(this.pos.x, this.pos.y);
  }

  render(context, deltaTime) {
    if(this.sprite)
      this.sprite.render(context, deltaTime, this.transformIndex);
  }

  _setCurrentSprite(name) {
    this.sprite = this.sprites[name];
  }
}


/***/ }),

/***/ "./app/Keyboard.ts":
/*!*************************!*\
  !*** ./app/Keyboard.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Keys": () => (/* binding */ Keys),
/* harmony export */   "default": () => (/* binding */ Keyboard)
/* harmony export */ });
const PRESSED = 1;
const RELEASED = 0;

const Keys = {
  Space: 'Space',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
};

class Keyboard {

  constructor() {
    this.keyStates = new Map();
    this.keyListeners = new Map();
  }

  addKeyListener(keyCode, callback) {
    this.keyListeners.set(keyCode, callback);
  }

  startListeningTo(eventSource) {
    // Attach to the key down and up events.
    ['keydown', 'keyup'].forEach(eventName => {
      eventSource.addEventListener(eventName, event => this._handleEvent(event));
    });
  }

  resetListeners() {
    this.keyListeners.clear();
    this.keyStates.clear();
  }

  getKeyState(keyCode) {
    return this.keyStates.get(keyCode);
  }

  _handleEvent(event) {
    const keyCode = event.code;

    // Checks if there is a listener for the pressed key
    if(!this.keyListeners.has(keyCode)) return;

    // Prevent the default browser behavior
    event.preventDefault();

    // Checks if the key was already in the state
    const keyState = event.type === 'keydown' ? PRESSED : RELEASED;
    if(this.keyStates.get(keyCode) === keyState) return;

    // Save the current key state and trigger the listener callback
    this.keyStates.set(keyCode, keyState);
    this.keyListeners.get(keyCode)(keyState, this);
  }
}


/***/ }),

/***/ "./app/Layer.ts":
/*!**********************!*\
  !*** ./app/Layer.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Layer)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./app/config.ts");


class Layer {

  constructor(pos, size) {
    // Initialize properties
    this.pos = pos.clone();
    this.size = size;
    this.sprites = [];
    // Initialize buffer
    this.buffer = document.createElement('canvas');
    this.buffer.width = size.width;
    this.buffer.height = size.height;
    this.context = this.buffer.getContext('2d');
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
  }

  update(deltaTime) {
    this.sprites.forEach(sprite => sprite.update(deltaTime));
  }

  render(context, deltaTime) {
    this._clear();
    this._renderSprites(deltaTime);
    context.drawImage(this.buffer, this.pos.x * _config__WEBPACK_IMPORTED_MODULE_0__["default"].grid.size, this.pos.y * _config__WEBPACK_IMPORTED_MODULE_0__["default"].grid.size);
  }

  _clear() {
    this.context.clearRect(0, 0, this.buffer.width, this.buffer.height);
  }

  _renderSprites(deltaTime) {
    this.sprites.forEach(sprite => {
      sprite.render(this.context, deltaTime);
    })
  }
}


/***/ }),

/***/ "./app/Level.ts":
/*!**********************!*\
  !*** ./app/Level.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Level)
/* harmony export */ });
/* harmony import */ var _Stage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Stage */ "./app/Stage.ts");


class Level {

  constructor(levelSpec, tilesMap, charactersMap, input) {
    this.levelSpec = levelSpec;
    this.tilesMap = tilesMap;
    this.charactersMap = charactersMap;
    this.input = input;
    this.currentStage;
  }

  getStage(stageNumber) {
    this.input.resetListeners();
    this.currentStage = new _Stage__WEBPACK_IMPORTED_MODULE_0__["default"](
      this.levelSpec.stages[`stage${stageNumber}`],
      this.tilesMap,
      this.charactersMap,
      this.input
    );
    return this.currentStage;
  }
}


/***/ }),

/***/ "./app/Range.ts":
/*!**********************!*\
  !*** ./app/Range.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Range)
/* harmony export */ });
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  forEach(fn, step = 1) {
    for (let value = this.start; value <= this.end; value += step) {
      fn(value);
    }
  }
}


/***/ }),

/***/ "./app/Sprite.ts":
/*!***********************!*\
  !*** ./app/Sprite.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Sprite)
/* harmony export */ });
/* harmony import */ var _libs_math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./libs/math */ "./app/libs/math.ts");
/* harmony import */ var _libs_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./libs/utils */ "./app/libs/utils.ts");
/* harmony import */ var _Animation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Animation */ "./app/Animation.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./config */ "./app/config.ts");





class Sprite {

  constructor(spriteData, pos = new _libs_math__WEBPACK_IMPORTED_MODULE_0__.Vec2(0, 0)) {
    if(spriteData.frames) {
      this.animation = spriteData;
    } else {
      this.images = (0,_libs_utils__WEBPACK_IMPORTED_MODULE_1__.castArray)(spriteData);
    }
    this.pos = pos.clone();
  }

  render(context, deltaTime, transformIndex = 0) {
    if(this.animation) {
      this.animation.render(context, deltaTime);
    } else {
      if(transformIndex >= this.images.length)
        transformIndex = 0;
      context.drawImage(
        this.images[transformIndex],
        this.pos.x * _config__WEBPACK_IMPORTED_MODULE_3__["default"].grid.size,
        this.pos.y * _config__WEBPACK_IMPORTED_MODULE_3__["default"].grid.size
      );
    }
  }
}


/***/ }),

/***/ "./app/SpriteMap.ts":
/*!**************************!*\
  !*** ./app/SpriteMap.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SpriteMap)
/* harmony export */ });
/* harmony import */ var _libs_math__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./libs/math */ "./app/libs/math.ts");
/* harmony import */ var _libs_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./libs/utils */ "./app/libs/utils.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config */ "./app/config.ts");
/* harmony import */ var _Sprite__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Sprite */ "./app/Sprite.ts");
/* harmony import */ var _Animation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Animation */ "./app/Animation.ts");








class SpriteMap {

  constructor(spritesSpec, spriteImageMap) {
    this.spriteImageMap = spriteImageMap;
    this.images = new Map();
    this.animationsData = new Map();
    spritesSpec.sprites.forEach(spriteSpec => this._createSpriteBuffer(spriteSpec));
    const animationsSpec = spritesSpec.animations || [];
    animationsSpec.forEach(animSpec => this._createAnimationData(animSpec));
  }

  getImage(imageName) {
    return this.images.get(imageName);
  }

  getAnimationData(animationName) {
    return this.animationsData.get(animationName);
  }

  newSprite(imageName, pos) {
    const image = this.getImage(imageName);
    return new _Sprite__WEBPACK_IMPORTED_MODULE_3__["default"](image, pos);
  }

  newAnimation(animationName, pos) {
    const animation = this.getAnimationData(animationName);
    return new _Animation__WEBPACK_IMPORTED_MODULE_4__["default"](animation, pos);
  }

  draw(imageName, context, pos = new _libs_math__WEBPACK_IMPORTED_MODULE_0__.Vec2(0, 0), transformIndex = 0) {
    context.drawImage(
      this.getImage(imageName)[transformIndex],
      pos.x * _config__WEBPACK_IMPORTED_MODULE_2__["default"].grid.size,
      pos.y * _config__WEBPACK_IMPORTED_MODULE_2__["default"].grid.size
    );
  }

  _createAnimationData(animSpec) {
    let framesImages = animSpec.frames.map(
      frameName => this.getImage(frameName)
    );
    this.animationsData.set(animSpec.name, {
      framesNames: animSpec.frames,
      frames: framesImages,
      frameTime: animSpec.frameTime
    });
  }

  _createSpriteBuffer(spriteSpec) {
    const pos = new _libs_math__WEBPACK_IMPORTED_MODULE_0__.Vec2(spriteSpec.position[0], spriteSpec.position[1]);
    const size = new _libs_math__WEBPACK_IMPORTED_MODULE_0__.Vec2(
      spriteSpec.size[0] * _config__WEBPACK_IMPORTED_MODULE_2__["default"].grid.size,
      spriteSpec.size[1] * _config__WEBPACK_IMPORTED_MODULE_2__["default"].grid.size
    );
    const buffers = (0,_libs_utils__WEBPACK_IMPORTED_MODULE_1__.castArray)(
      this._createTransformedBuffer(pos, size, spriteSpec.transformation)
    );
    this.images.set(spriteSpec.name, buffers);
  }

  _createTransformedBuffer(pos, size, transformation) {
    switch (transformation) {
      case 'rotated':
        return this._createRotatedBuffer(pos, size);

      case 'flipped':
        return this._createFlipped(pos, size);

      default:
        return this._createBuffer(pos, size);
    }
  }

  _createRotatedBuffer(pos, size) {
    return [0, 90, 180, 270].map(rotation =>
      this._createBuffer(pos, size, { rotation })
    );
  }

  _createFlipped(pos, size) {
    return [false, true].map(flipped =>
      this._createBuffer(pos, size, { flipped })
    );
  }

  _createBuffer(pos, size, { rotation, flipped } = {}) {
    const buffer = document.createElement('canvas');
    const isRotated = rotation === 90 || rotation === 270;
    const spriteSize = size.clone();
    if (isRotated) spriteSize.swap();
    buffer.width = spriteSize.x;
    buffer.height = spriteSize.y;

    const context = buffer.getContext('2d');
    if (flipped) {
      context.scale(-1, 1);
      context.translate(-spriteSize.x, 0);
    }

    if (rotation) {
      let transX = isRotated && rotation === 270 ? 0 : spriteSize.x;
      let transY = isRotated && rotation === 90 ? 0 : spriteSize.y;
      context.translate(transX, transY);
      context.rotate((0,_libs_math__WEBPACK_IMPORTED_MODULE_0__.degToRad)(rotation));
    }

    context.drawImage(
      this.spriteImageMap,
      pos.x, pos.y,
      size.x, size.y,
      0, 0,
      size.x, size.y
    );
    return buffer;
  }
}


/***/ }),

/***/ "./app/Stage.ts":
/*!**********************!*\
  !*** ./app/Stage.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Stage)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./app/config.ts");
/* harmony import */ var _libs_math__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./libs/math */ "./app/libs/math.ts");
/* harmony import */ var _libs_bind__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./libs/bind */ "./app/libs/bind.ts");
/* harmony import */ var _libs_stage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./libs/stage */ "./app/libs/stage.ts");
/* harmony import */ var _Layer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Layer */ "./app/Layer.ts");
/* harmony import */ var _Block__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Block */ "./app/Block.ts");
/* harmony import */ var _entities_Qbert__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./entities/Qbert */ "./app/entities/Qbert.ts");
/* harmony import */ var _entities_Pill__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./entities/Pill */ "./app/entities/Pill.ts");










const entitiesLayerPos = new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(0.5, -1.4);

const refBlockPos = new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(3, 3);
const blocksPos = new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(
  _config__WEBPACK_IMPORTED_MODULE_0__["default"].block.startPosition.x,
  _config__WEBPACK_IMPORTED_MODULE_0__["default"].block.startPosition.y
);

class Stage {

  constructor(stageSpec, tilesMap, charactersMap, input) {
    // Initialize properties
    this.tilesMap = tilesMap;
    this.blocksData = new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Matrix();
    this.entities = new Set();
    this.entitiesLayer = new _Layer__WEBPACK_IMPORTED_MODULE_4__["default"](entitiesLayerPos, _config__WEBPACK_IMPORTED_MODULE_0__["default"].screen);
    this.cleared = false;

    // Create entities
    const startPos = new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(stageSpec.startPos);
    this.qbert = new _entities_Qbert__WEBPACK_IMPORTED_MODULE_6__["default"](charactersMap, startPos);
    this.entitiesLayer.addSprite(this.qbert);
    this.qbert.jump.onEndListeners.add((0,_libs_stage__WEBPACK_IMPORTED_MODULE_3__.createDieIfOutOfBoundariesCallBack)(this.blocksData));

    this.entitiesTest(charactersMap);

    // Initialize stage
    this._initializeBuffer();
    this._initializeLevelBlocks(stageSpec);
    this._initializeQbertListeners();

    // Bind keys
    (0,_libs_bind__WEBPACK_IMPORTED_MODULE_2__.jumpWithKeys)(input, this.qbert);

    // Events listeners
    this.onLevelClearedListeners = new Set();
  }

  // It will be removed. Only for tests.
  entitiesTest(charactersMap) {
    const pill = new _entities_Pill__WEBPACK_IMPORTED_MODULE_7__["default"](charactersMap,'green');
    this.entitiesLayer.addSprite(pill);
    setTimeout(() => pill.spawn.start(new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(12, 5)), 3000);
    pill.jump.onEndListeners.add((0,_libs_stage__WEBPACK_IMPORTED_MODULE_3__.createDieIfOutOfBoundariesCallBack)(this.blocksData));

    const pill2 = new _entities_Pill__WEBPACK_IMPORTED_MODULE_7__["default"](charactersMap,'beige');
    this.entitiesLayer.addSprite(pill2);
    setTimeout(() => pill2.spawn.start(new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(18, 5)), 6000);
    pill2.jump.onEndListeners.add((0,_libs_stage__WEBPACK_IMPORTED_MODULE_3__.createDieIfOutOfBoundariesCallBack)(this.blocksData));

    const pill3 = new _entities_Pill__WEBPACK_IMPORTED_MODULE_7__["default"](charactersMap,'red');
    this.entitiesLayer.addSprite(pill3);
    setTimeout(() => pill3.spawn.start(new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(12, 5)), 10000);
    pill3.jump.onEndListeners.add((0,_libs_stage__WEBPACK_IMPORTED_MODULE_3__.createDieIfOutOfBoundariesCallBack)(this.blocksData));

    const pill4 = new _entities_Pill__WEBPACK_IMPORTED_MODULE_7__["default"](charactersMap,'blue');
    this.entitiesLayer.addSprite(pill4);
    setTimeout(() => pill4.spawn.start(new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(18, 5)), 15000);
    pill4.jump.onEndListeners.add((0,_libs_stage__WEBPACK_IMPORTED_MODULE_3__.createDieIfOutOfBoundariesCallBack)(this.blocksData));

  }

  update(deltaTime) {
    this.entitiesLayer.update(deltaTime);
  }

  render(context, deltaTime) {
    if(this.currentBlock) {
      this.currentBlock.render(this.context, deltaTime);
    }
    context.drawImage(this.buffer, 0, 0);
    this.entitiesLayer.render(context, deltaTime);
  }

  triggerOnLevelCleared() {
    this.onLevelClearedListeners.forEach(listener => listener());
  }

  _initializeBuffer() {
    this.buffer = document.createElement('canvas');
    this.buffer.width = _config__WEBPACK_IMPORTED_MODULE_0__["default"].screen.width;
    this.buffer.height = _config__WEBPACK_IMPORTED_MODULE_0__["default"].screen.height;
    this.context = this.buffer.getContext('2d');
  }

  _initializeLevelBlocks(stageSpec) {
    // Draw reference block into the stage buffer.
    this.refBlockName = stageSpec.refBlock;
    this.tilesMap.draw(stageSpec.refBlock, this.context, refBlockPos);

    // Draw stage blocks into the stage buffer.
    let pos = blocksPos.clone();
    stageSpec.blocks.forEach(line => {
      line.forEach(blockName => {
        if(blockName) {
          this._createBlock(blockName, pos);
        }
        pos.moveX(_config__WEBPACK_IMPORTED_MODULE_0__["default"].block.distance.column);
      });
      pos.x = blocksPos.x;
      pos.moveY(_config__WEBPACK_IMPORTED_MODULE_0__["default"].block.distance.line);
    });
  }

  _initializeQbertListeners() {
    // Jump listeners
    this.qbert.jump.onStartListeners.add(direction => {
      this.currentBlock = this.blocksData.get(this.qbert.pos.y, this.qbert.pos.x);
      this.currentBlock.rotate(direction);
    });
    this.qbert.jump.onEndListeners.add(() => {
      if(this.cleared) {
        this.qbert.win.start(3);
        this.triggerOnLevelCleared();
      }
    });

    // Die process listener
    this.qbert.die.onEndListeners.add(() => {
      setTimeout(() => this.qbert.spawn.start(new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(15, 3)), 500);
    });

    // Spawn process
    this.qbert.spawn.onEndListeners.add(() => {
      this.qbert.jump.enable();
    });
  }

  _createBlock(blockName, pos) {
    let block = new _Block__WEBPACK_IMPORTED_MODULE_5__["default"](blockName, this.tilesMap, pos);
    block.addRotateEndHandler((block) => this._checkBlock(block));
    this.blocksData.set(pos.y, pos.x, block);
    this.tilesMap.draw(blockName, this.context, pos);
  }

  _checkBlock(block) {
    if(block.currentSpriteName === this.refBlockName) {
      block.markAsCleared();
      if((0,_libs_stage__WEBPACK_IMPORTED_MODULE_3__.isStageCleared)(this.blocksData, block)) {
        this.cleared = true;
      };
    }
  }
}


/***/ }),

/***/ "./app/Timer.ts":
/*!**********************!*\
  !*** ./app/Timer.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Timer)
/* harmony export */ });
class Timer {
  constructor(deltaTime = 1 / 60) {
    let lastTime = 0;
    let accumulatedTime = 0;

    this.updateProxy = time => {
      accumulatedTime += (time - lastTime) / 1000;

      while (accumulatedTime > deltaTime) {
        if (this.update) this.update(deltaTime);
        accumulatedTime -= deltaTime;
      }
      lastTime = time;
      this.enqueue();
    };
  }

  enqueue() {
    requestAnimationFrame(this.updateProxy);
  }

  start() {
    this.enqueue();
  }
}


/***/ }),

/***/ "./app/behaviors/Die.ts":
/*!******************************!*\
  !*** ./app/behaviors/Die.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Die)
/* harmony export */ });
/* harmony import */ var _Behavior__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Behavior */ "./app/Behavior.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./app/config.ts");



class Die extends _Behavior__WEBPACK_IMPORTED_MODULE_0__["default"] {

  constructor() {
    super('die');
    this.reset();
    this.speed = 12;

    this.onStartListeners.add(entity => {
      if(entity.jump && entity.jump.isEnabled) {
        entity.jump.disable();
      }
    });
  }

  start() {
    if(this.isActive()) return;
    this.reset();
    this.isDying = true;
  }

  isActive() {
    return this.isDying;
  }

  update(entity, deltaTime) {
    this._dyingUpdate(entity);
    if(this.isDying) {
      this._move(entity, deltaTime);
    }
  }

  reset() {
    this.isDying = false;
    this.position = undefined;
  }

  _move(entity, deltaTime) {
    this.position.moveY(this.speed * deltaTime);
    entity.pos.setY(this.position.y);
  }

  _dyingUpdate(entity) {
    if(!this.isDying) return;

    if(!this.position) {
      this.position = entity.pos;
      this.triggerOnStart(entity);
    }
    if(entity.pos.y >= _config__WEBPACK_IMPORTED_MODULE_1__["default"].grid.lines + 2) {
      this.reset();
      this.triggerOnEnd(entity);
    }
  }
}


/***/ }),

/***/ "./app/behaviors/Jump.ts":
/*!*******************************!*\
  !*** ./app/behaviors/Jump.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DOWN": () => (/* binding */ DOWN),
/* harmony export */   "LEFT": () => (/* binding */ LEFT),
/* harmony export */   "RIGHT": () => (/* binding */ RIGHT),
/* harmony export */   "UP": () => (/* binding */ UP),
/* harmony export */   "default": () => (/* binding */ Jump)
/* harmony export */ });
/* harmony import */ var _Behavior__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Behavior */ "./app/Behavior.ts");
/* harmony import */ var _libs_math__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../libs/math */ "./app/libs/math.ts");



const LEFT = -1;
const RIGHT = 1;
const UP = -1;
const DOWN = 1;

class Jump extends _Behavior__WEBPACK_IMPORTED_MODULE_0__["default"] {

  constructor() {
    super('jump');
    this.isEnabled = true;
    this.speed = 250;
    this.ratio = new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(3, 2);
    this.reset();
  }

  reset() {
    this.isJumping = false;
    this.direction = new _libs_math__WEBPACK_IMPORTED_MODULE_1__.Vec2(LEFT, DOWN);
    this.lastPos = this.direction.clone();
  }

  enable() {
    this.isEnabled = true;
  }
;
  disable() {
    this.isEnabled = false;
  }

  leftDown() {
    this._start(LEFT, DOWN);
  }

  leftUp() {
    this._start(LEFT, UP);
  }

  rightDown() {
    this._start(RIGHT, DOWN);
  }

  rightUp() {
    this._start(RIGHT, UP);
  }

  isToLeft() {
    return this.direction.x === LEFT;
  }

  isToRight() {
    return this.direction.x === RIGHT;
  }

  isToDown() {
    return this.direction.y === DOWN;
  }

  isToUp() {
    return this.direction.y === UP;
  }

  update(entity, deltaTime) {
    if(!this.isJumping) return;

    this.angle += this.speed * deltaTime;

    let finished = this.angle > this.maxAngle;
    if(finished) {
      this.angle = this.maxAngle;
    }

    this._moveEntity(entity);

    if(finished) {
      this._normalizeEntityPos(entity);
      this.triggerOnEnd(entity);
      this.isJumping = false;
    }
  }

  _moveEntity(entity) {
    let radAngle = (0,_libs_math__WEBPACK_IMPORTED_MODULE_1__.degToRad)(this.refAngle - this.angle);
    let x = Math.sin(radAngle);
    let y = Math.cos(radAngle);

    entity.pos.move(
      Math.abs(x - this.lastPos.x) * this.ratio.x * this.direction.x,
      Math.abs(y - this.lastPos.y) * this.ratio.y * this.direction.y
    );
    this.lastPos.set(x, y);
  }

  _normalizeEntityPos(entity) {
    entity.pos.set(
      Math.round(entity.pos.x),
      Math.round(entity.pos.y)
    );
  }

  _start(directionX, directionY) {
    if(this.isJumping || !this.isEnabled) return;

    this.isJumping = true;
    this.direction.set(directionX, directionY);
    this.lastPos.set(
      directionY > 0 ? 0 : 1,
      directionY > 0 ? 1 : 0
    );
    this.angle = 0;
    this.maxAngle = 90;
    this.refAngle = directionY > 0 ? 0 : 90;

    this.triggerOnStart(this.direction.clone());
  }
}


/***/ }),

/***/ "./app/behaviors/Spawn.ts":
/*!********************************!*\
  !*** ./app/behaviors/Spawn.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Spawn)
/* harmony export */ });
/* harmony import */ var _Behavior__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Behavior */ "./app/Behavior.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./app/config.ts");



class Spawn extends _Behavior__WEBPACK_IMPORTED_MODULE_0__["default"] {

  constructor() {
    super('spawn');
    this.reset();
    this.speed = 5;
  }

  start(finalPos) {
    if(this.isActive()) return;
    this.reset();
    this.isSpawning = true;
    this.position = finalPos.clone();
    this.position.y = -2;
    this.finalPos = finalPos;
    this.triggerOnStart();
  }

  isActive() {
    return this.isSpawning;
  }

  update(entity, deltaTime) {
    this._checkIfFinished(entity);
    if(this.isSpawning) {
      this._move(entity, deltaTime);
    }
  }

  reset() {
    this.isSpawning = false;
  }

  _move(entity, deltaTime) {
    this.position.moveY(this.speed * deltaTime);
    entity.pos.set(this.position.x, this.position.y);
  }

  _checkIfFinished(entity) {
    if(!this.isSpawning) return;
    if(entity.pos.y >= this.finalPos.y &&
       entity.pos.y < _config__WEBPACK_IMPORTED_MODULE_1__["default"].grid.lines) {
      entity.pos.set(this.finalPos.x, this.finalPos.y);
      this.isSpawning = false;
      this.triggerOnEnd();
    }
  }
}


/***/ }),

/***/ "./app/behaviors/Win.ts":
/*!******************************!*\
  !*** ./app/behaviors/Win.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Win)
/* harmony export */ });
/* harmony import */ var _Behavior__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Behavior */ "./app/Behavior.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./app/config.ts");



class Win extends _Behavior__WEBPACK_IMPORTED_MODULE_0__["default"] {

  constructor() {
    super('win');
    this.speed = 5;
    this.distance = 1;
    this.onLowestPointListeners = new Set();
    this.onHighestPointListeners = new Set();
  }

  start(times = 1) {
    if(times <= 0) return;
    this.times = times;
    this.isRunning = true;
    this.initialPosition = undefined;
    this.direction = -1;
    this.triggerOnStart();
  }

  triggerOnHighestPoint() {
    this.onHighestPointListeners.forEach(listener => listener());
  }

  triggerOnLowestPoint() {
    this.onLowestPointListeners.forEach(listener => listener());
  }

  update(entity, deltaTime) {
    if(!this.isRunning) return;

    // Gets the initial entity position
    if(!this.initialPosition) {
      this.initialPosition = entity.pos.y;
      this.targetPosition = this.initialPosition - this.distance;
      if(entity.jump)
        entity.jump.disable();
    }
    // Calculates the movement position
    let newPosition = entity.pos.y + this.speed * deltaTime * this.direction;

    if(newPosition < this.targetPosition) {
      newPosition = this.targetPosition;
      this.direction *= -1;
      this.triggerOnHighestPoint();
    } else if(newPosition > this.initialPosition) {
      newPosition = this.initialPosition;
      if(--this.times === 0) {
        this.isRunning = false;
        this.triggerOnEnd();
      } else {
        this.triggerOnLowestPoint();
      }
      this.direction *= -1;
    }

    // Move the entity
    entity.pos.setY(newPosition);
  }
}


/***/ }),

/***/ "./app/config.ts":
/*!***********************!*\
  !*** ./app/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  screen: {
    width: 512,
    height: 384,
  },
  grid: {
    lines: parseInt(364 / 16),
    columns: parseInt(512 / 16),
    size: 16,
  },
  block: {
    startPosition: {
      x: 3,
      y: 3
    },
    distance: {
      line: 2,
      column: 3
    }
  }
});


/***/ }),

/***/ "./app/entities/Pill.ts":
/*!******************************!*\
  !*** ./app/entities/Pill.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Pill)
/* harmony export */ });
/* harmony import */ var _Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Entity */ "./app/Entity.ts");
/* harmony import */ var _behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../behaviors/Jump */ "./app/behaviors/Jump.ts");
/* harmony import */ var _behaviors_Spawn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../behaviors/Spawn */ "./app/behaviors/Spawn.ts");
/* harmony import */ var _behaviors_Die__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../behaviors/Die */ "./app/behaviors/Die.ts");
/* harmony import */ var _libs_math__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../libs/math */ "./app/libs/math.ts");






class Pill extends _Entity__WEBPACK_IMPORTED_MODULE_0__["default"] {

  constructor(spriteMap, color) {
    super(new _libs_math__WEBPACK_IMPORTED_MODULE_4__.Vec2(13, -2));

    this.color = color;
    this.accumulatedTime = 0;
    this.jumpInterval = 1500;

    this._initializeSprites(spriteMap);
    this._setCurrentSprite('idle');

    this.addBehavior(new _behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__["default"]());
    this.addBehavior(new _behaviors_Spawn__WEBPACK_IMPORTED_MODULE_2__["default"]());
    this.addBehavior(new _behaviors_Die__WEBPACK_IMPORTED_MODULE_3__["default"]());

    this._bindEvents();
  }

  update(deltaTime) {
    if(this.ready) {
      this.accumulatedTime += deltaTime * 1000;
    }

    if(this.accumulatedTime >= this.jumpInterval) {
      this.accumulatedTime = 0;
      this.randomJump();
    }

    super.update(deltaTime);
  }

  randomJump() {
    if(Math.random() < 0.5)
      this.jump.rightDown();
    else
      this.jump.leftDown();
  }

  _initializeSprites(spriteMap) {
    this.sprites = {
      'idle': spriteMap.newSprite(`pill-${this.color}`),
      'idle-jumping': spriteMap.newSprite(`pill-${this.color}-jumping`),
      'dying': spriteMap.newAnimation(`pill-${this.color}-dying`),
    };
  }

  _bindEvents() {
    this.spawn.onEndListeners.add(() => this.ready = true);

    this.jump.onStartListeners.add(() => this._setCurrentSprite('idle-jumping'));
    this.jump.onEndListeners.add(() => this._setCurrentSprite('idle'));

    this.die.onStartListeners.add(() => {
      this.sprites.dying.playInLoop();
      this._setCurrentSprite('dying');
    });

    this.die.onEndListeners.add(() => {
      this.sprites.dying.stop();
      this._setCurrentSprite('idle');
    });
  }
}


/***/ }),

/***/ "./app/entities/Qbert.ts":
/*!*******************************!*\
  !*** ./app/entities/Qbert.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Qbert)
/* harmony export */ });
/* harmony import */ var _Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Entity */ "./app/Entity.ts");
/* harmony import */ var _behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../behaviors/Jump */ "./app/behaviors/Jump.ts");
/* harmony import */ var _behaviors_Spawn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../behaviors/Spawn */ "./app/behaviors/Spawn.ts");
/* harmony import */ var _behaviors_Die__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../behaviors/Die */ "./app/behaviors/Die.ts");
/* harmony import */ var _behaviors_Win__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../behaviors/Win */ "./app/behaviors/Win.ts");






const LEFT = 0;
const RIGHT = 1;

const STATE_IDLE = 'idle';
const STATE_WON = 'won';
const STATE_JUMPING = 'jumping';

class Qbert extends _Entity__WEBPACK_IMPORTED_MODULE_0__["default"] {

  constructor(spriteMap, pos) {
    super(pos);
    this._initializeSprites(spriteMap);

    // Initial state
    this.state = STATE_IDLE;

    this.addBehavior(new _behaviors_Jump__WEBPACK_IMPORTED_MODULE_1__["default"]());
    this.addBehavior(new _behaviors_Spawn__WEBPACK_IMPORTED_MODULE_2__["default"]());
    this.addBehavior(new _behaviors_Win__WEBPACK_IMPORTED_MODULE_4__["default"]());
    this.addBehavior(new _behaviors_Die__WEBPACK_IMPORTED_MODULE_3__["default"]());

    this._bindDieListeners();
    this._bindWinListeners();
  }

  update(deltaTime) {
    this._updateSprite();
    super.update(deltaTime);
  }

  _bindDieListeners() {
    this.die.onStartListeners.add(() => {
      this.sprites.dying.playInLoop();
      this._setCurrentSprite('dying');
    });

    this.die.onEndListeners.add(() => {
      this.sprites.dying.stop();
      this.jump.reset();
      this._setCurrentSprite('idle-front');
    });
  }

  _bindWinListeners() {
    this.win.onStartListeners.add(() => {
      this.state = STATE_WON;
      this._setCurrentSprite('win-jump');
    });
    this.win.onLowestPointListeners.add(() => this._setCurrentSprite('win-jump'));
    this.win.onHighestPointListeners.add(() => this._setCurrentSprite('win'));
    this.win.onEndListeners.add(() => this._setCurrentSprite('win'));
  }

  _updateSprite() {
    if(this.die.isDying || this.state === STATE_WON) return;

    // Updates the direction
    const xDirection = this.jump.isToLeft() ? LEFT : RIGHT;
    this.transformIndex = xDirection;

    // Updates the state
    this.state = this.jump.isJumping ? STATE_JUMPING : STATE_IDLE;
    const yDirection = this.jump.isToDown() ? 'front' : 'back';

    this._setCurrentSprite(`${this.state}-${yDirection}`);
  }

  _initializeSprites(spriteMap) {
    this.sprites = {
      'idle-front': spriteMap.newSprite('qbert-front'),
      'idle-back': spriteMap.newSprite('qbert-back'),
      'jumping-front': spriteMap.newSprite('qbert-front-jumping'),
      'jumping-back': spriteMap.newSprite('qbert-back-jumping'),
      'dying': spriteMap.newAnimation('qbert-dying'),
      'win': spriteMap.newSprite('qbert-wining'),
      'win-jump': spriteMap.newSprite('qbert-wining-jump'),
    };
  }
}


/***/ }),

/***/ "./app/game.ts":
/*!*********************!*\
  !*** ./app/game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _libs_loaders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./libs/loaders */ "./app/libs/loaders.ts");
/* harmony import */ var _Timer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Timer */ "./app/Timer.ts");
/* harmony import */ var _Compositor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Compositor */ "./app/Compositor.ts");
/* harmony import */ var _Keyboard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Keyboard */ "./app/Keyboard.ts");






async function main(canvas) {
  canvas.focus();
  const context = canvas.getContext('2d');

  // Input
  const input = new _Keyboard__WEBPACK_IMPORTED_MODULE_3__["default"]();

  // Maps
  const tilesMap = await (0,_libs_loaders__WEBPACK_IMPORTED_MODULE_0__.loadSprites)('tiles.json');
  const charactersMap = await (0,_libs_loaders__WEBPACK_IMPORTED_MODULE_0__.loadSprites)('characters.json');
  const bgMap = await (0,_libs_loaders__WEBPACK_IMPORTED_MODULE_0__.loadBackgrounds)('backgrounds.json', tilesMap);

  // Level
  const level1 = await (0,_libs_loaders__WEBPACK_IMPORTED_MODULE_0__.loadLevel)(1, tilesMap, charactersMap, input);

  // Compositor
  const compositor = new _Compositor__WEBPACK_IMPORTED_MODULE_2__["default"]();

  const background = bgMap.getNewAnimation('bg-game');
  compositor.addLayer(background);

  const stage1 = level1.getStage(1);
  compositor.addLayer(stage1);

  stage1.onLevelClearedListeners.add(() => {
    background.playInLoop();
  });

  // Start listening the input
  input.startListeningTo(window);

  // Time based main loop
  const timer = new _Timer__WEBPACK_IMPORTED_MODULE_1__["default"]();
  timer.update = deltaTime => {
    compositor.update(deltaTime);
    compositor.render(context, deltaTime);
  };
  timer.start();
}

main(document.getElementById('game'));


/***/ }),

/***/ "./app/libs/bind.ts":
/*!**************************!*\
  !*** ./app/libs/bind.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "jumpWithKeys": () => (/* binding */ jumpWithKeys)
/* harmony export */ });
/* harmony import */ var _Keyboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Keyboard */ "./app/Keyboard.ts");


function jumpWithKeys(keyboard, entity) {
  keyboard.addKeyListener(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowLeft, (state) => {
    if(state && keyboard.getKeyState(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowUp))
      entity.jump.leftUp();
    else if(state && keyboard.getKeyState(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowDown))
      entity.jump.leftDown();
  });

  keyboard.addKeyListener(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowRight, (state) => {
    if(state && keyboard.getKeyState(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowUp))
      entity.jump.rightUp();
    else if(state && keyboard.getKeyState(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowDown))
      entity.jump.rightDown();
  });

  keyboard.addKeyListener(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowUp, (state) => {
    if(state && keyboard.getKeyState(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowLeft))
      entity.jump.leftUp();
    else if(state && keyboard.getKeyState(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowRight))
      entity.jump.rightUp();
  });

  keyboard.addKeyListener(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowDown, (state) => {
    if(state && keyboard.getKeyState(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowLeft))
      entity.jump.leftDown();
    else if(state && keyboard.getKeyState(_Keyboard__WEBPACK_IMPORTED_MODULE_0__.Keys.ArrowRight))
      entity.jump.rightDown();
  });
}


/***/ }),

/***/ "./app/libs/loaders.ts":
/*!*****************************!*\
  !*** ./app/libs/loaders.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loadBackgrounds": () => (/* binding */ loadBackgrounds),
/* harmony export */   "loadImage": () => (/* binding */ loadImage),
/* harmony export */   "loadJson": () => (/* binding */ loadJson),
/* harmony export */   "loadLevel": () => (/* binding */ loadLevel),
/* harmony export */   "loadSprites": () => (/* binding */ loadSprites)
/* harmony export */ });
/* harmony import */ var _BackgroundMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BackgroundMap */ "./app/BackgroundMap.ts");
/* harmony import */ var _SpriteMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../SpriteMap */ "./app/SpriteMap.ts");
/* harmony import */ var _Level__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Level */ "./app/Level.ts");




function loadImage(imageFile) {
  return new Promise(resolve => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.src = `assets/imgs/${imageFile}`;
  });
}

function loadSprites(spritesSpecName) {
  return loadJson(`specs/${spritesSpecName}`)
    .then(spritesSpec => Promise.all([spritesSpec, loadImage(spritesSpec.imageFile)]))
    .then(([spritesSpec, image]) => new _SpriteMap__WEBPACK_IMPORTED_MODULE_1__["default"](spritesSpec, image));
}

function loadBackgrounds(bgSpecName, tilesMap) {
  return loadJson(`specs/${bgSpecName}`)
    .then(bgSpec => new _BackgroundMap__WEBPACK_IMPORTED_MODULE_0__["default"](bgSpec, tilesMap));
}

function loadLevel(levelNumber, tilesMap, charactersMap, input) {
  return loadJson(`levels/level-${levelNumber}.json`)
    .then(levelSpec => new _Level__WEBPACK_IMPORTED_MODULE_2__["default"](levelSpec, tilesMap, charactersMap, input));
}

function loadJson(fileName) {
  return fetch(`assets/${fileName}`).then(resp => resp.json());
}


/***/ }),

/***/ "./app/libs/math.ts":
/*!**************************!*\
  !*** ./app/libs/math.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Matrix": () => (/* binding */ Matrix),
/* harmony export */   "Vec2": () => (/* binding */ Vec2),
/* harmony export */   "degToRad": () => (/* binding */ degToRad),
/* harmony export */   "toFixed": () => (/* binding */ toFixed)
/* harmony export */ });
function degToRad(deg) {
  return deg * Math.PI / 180;
}

function toFixed(number, decimals) {
  let factor = Math.pow(10, decimals);
  let signal = number >= 0 ? 1 : -1;
  return Math.round((number * factor) + (signal * 0.0001)) / factor;
}

class Vec2 {
  constructor(x, y) {
    if(Array.isArray(x)) {
      y = x[1];
      x = x[0];
    }
    this.x = x;
    this.y = y;
  }

  swap() {
    this.y = [this.x, (this.x = this.y)][0];
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  set(x, y) {
    this.setX(x);
    this.setY(y);
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  move(x, y) {
    this.moveX(x);
    this.moveY(y);
  }

  moveX(x) {
    this.x += x;
  }

  moveY(y) {
    this.y += y;
  }
}

class Matrix {
  constructor() {
    this.matrix = [];
  }

  set(x, y, value) {
    let col = this.matrix[x];
    if(!col) {
      col = [];
      this.matrix[x] = col;
    }
    col[y] = value;
  }

  get(x, y) {
    let col = this.matrix[x];
    return col ? col[y] : undefined;
  }
}


/***/ }),

/***/ "./app/libs/stage.ts":
/*!***************************!*\
  !*** ./app/libs/stage.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createDieIfOutOfBoundariesCallBack": () => (/* binding */ createDieIfOutOfBoundariesCallBack),
/* harmony export */   "isStageCleared": () => (/* binding */ isStageCleared)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config */ "./app/config.ts");


// The blocks distance
const distance = Object.assign({}, _config__WEBPACK_IMPORTED_MODULE_0__["default"].block.distance);

// The directions steps
const directions = [
  { line: 0, column: 2 },
  { line: 2, column: 0 },
  { line: 1, column: 1 },
  { line: -1, column: 1 },
];

function createDieIfOutOfBoundariesCallBack(blocksData) {
  return (entity) => {
    let block = blocksData.get(entity.pos.y, entity.pos.x);
    if(!block && entity.die)
      entity.die.start();
  }
}

function isStageCleared(blocksData, refBlock) {
  let cleared = false;
  directions.forEach(direction => {
    if(cleared) return;

    // Initialize the blocks in the given direction to be checked
    direction = invertDirection(direction);
    let blocks = [
      getNextBlock(blocksData, refBlock, direction),
      refBlock
    ];
    // Verifies if the direction was cleared
    cleared = isDirectionCleared(blocksData, blocks, direction);
  });
  return cleared;
}

function isDirectionCleared(blocksData, blocks, direction) {
  let clearedCount = 0;
  while(blocks[0] || blocks[1]) {
    blocks = blocks.map(block => {
      if(block && block.cleared) {
        clearedCount++;
        block = getNextBlock(blocksData, block, direction);
      } else {
        block = undefined;
      }
      direction = invertDirection(direction);
      return block;
    });
  }
  return clearedCount >= 5;
}

function invertDirection(direction) {
  return {
    line: direction.line * -1,
    column: direction.column * -1
  };
}

function getNextBlock(blocksData, block, direction) {
  return blocksData.get(
    block.pos.y + distance.line   * direction.line,
    block.pos.x + distance.column * direction.column
  );
}


/***/ }),

/***/ "./app/libs/utils.ts":
/*!***************************!*\
  !*** ./app/libs/utils.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "castArray": () => (/* binding */ castArray)
/* harmony export */ });
function castArray(data) {
  return Array.isArray(data) ? data : [data];
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app/game */ "./app/game.ts");


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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cC9BbmltYXRpb24udHMiLCJ3ZWJwYWNrOi8vLy4vYXBwL0JhY2tncm91bmQudHMiLCJ3ZWJwYWNrOi8vLy4vYXBwL0JhY2tncm91bmRNYXAudHMiLCJ3ZWJwYWNrOi8vLy4vYXBwL0JlaGF2aW9yLnRzIiwid2VicGFjazovLy8uL2FwcC9CbG9jay50cyIsIndlYnBhY2s6Ly8vLi9hcHAvQ29tcG9zaXRvci50cyIsIndlYnBhY2s6Ly8vLi9hcHAvRW50aXR5LnRzIiwid2VicGFjazovLy8uL2FwcC9LZXlib2FyZC50cyIsIndlYnBhY2s6Ly8vLi9hcHAvTGF5ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vYXBwL0xldmVsLnRzIiwid2VicGFjazovLy8uL2FwcC9SYW5nZS50cyIsIndlYnBhY2s6Ly8vLi9hcHAvU3ByaXRlLnRzIiwid2VicGFjazovLy8uL2FwcC9TcHJpdGVNYXAudHMiLCJ3ZWJwYWNrOi8vLy4vYXBwL1N0YWdlLnRzIiwid2VicGFjazovLy8uL2FwcC9UaW1lci50cyIsIndlYnBhY2s6Ly8vLi9hcHAvYmVoYXZpb3JzL0RpZS50cyIsIndlYnBhY2s6Ly8vLi9hcHAvYmVoYXZpb3JzL0p1bXAudHMiLCJ3ZWJwYWNrOi8vLy4vYXBwL2JlaGF2aW9ycy9TcGF3bi50cyIsIndlYnBhY2s6Ly8vLi9hcHAvYmVoYXZpb3JzL1dpbi50cyIsIndlYnBhY2s6Ly8vLi9hcHAvY29uZmlnLnRzIiwid2VicGFjazovLy8uL2FwcC9lbnRpdGllcy9QaWxsLnRzIiwid2VicGFjazovLy8uL2FwcC9lbnRpdGllcy9RYmVydC50cyIsIndlYnBhY2s6Ly8vLi9hcHAvZ2FtZS50cyIsIndlYnBhY2s6Ly8vLi9hcHAvbGlicy9iaW5kLnRzIiwid2VicGFjazovLy8uL2FwcC9saWJzL2xvYWRlcnMudHMiLCJ3ZWJwYWNrOi8vLy4vYXBwL2xpYnMvbWF0aC50cyIsIndlYnBhY2s6Ly8vLi9hcHAvbGlicy9zdGFnZS50cyIsIndlYnBhY2s6Ly8vLi9hcHAvbGlicy91dGlscy50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi9saWJzL21hdGgnO1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IGNhc3RBcnJheSB9IGZyb20gJy4vbGlicy91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuaW1hdGlvbiB7XG5cbiAgY29uc3RydWN0b3IoYW5pbWF0aW9uRGF0YSwgcG9zID0gbmV3IFZlYzIoMCwgMCkpIHtcbiAgICB0aGlzLmZyYW1lcyA9IGFuaW1hdGlvbkRhdGEuZnJhbWVzLm1hcChmcmFtZSA9PiBjYXN0QXJyYXkoZnJhbWUpKTtcbiAgICB0aGlzLmZyYW1lc05hbWVzID0gYW5pbWF0aW9uRGF0YS5mcmFtZXNOYW1lcztcbiAgICB0aGlzLmZyYW1lVGltZSA9IGFuaW1hdGlvbkRhdGEuZnJhbWVUaW1lIC8gMTAwMDtcbiAgICB0aGlzLmZyYW1lc0NvdW50ID0gdGhpcy5mcmFtZXMubGVuZ3RoO1xuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5wb3MgPSBwb3MuY2xvbmUoKTtcbiAgICB0aGlzLnRyYW5zZm9ybUluZGV4ID0gMDtcbiAgICB0aGlzLm9uQW5pbWF0aW9uRW5kTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgcGxheUluTG9vcCgpIHtcbiAgICB0aGlzLnBsYXkodHJ1ZSk7XG4gIH1cblxuICBwbGF5KGxvb3AgPSBmYWxzZSkge1xuICAgIHRoaXMubG9vcCA9IGxvb3A7XG4gICAgdGhpcy5lbmRlZCA9IGZhbHNlO1xuICAgIHRoaXMuZnJhbWVJbmRleCA9IDA7XG4gICAgdGhpcy5lbGFwc2VkVGltZSA9IDA7XG4gICAgdGhpcy5zaG93KCk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMubG9vcCA9IGZhbHNlO1xuICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICB9XG5cbiAgc2hvdygpIHtcbiAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICB9XG5cbiAgaGlkZSgpIHtcbiAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgfVxuXG4gIGdldEZyYW1lTmFtZShmcmFtZUluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWVzTmFtZXNbZnJhbWVJbmRleF07XG4gIH1cblxuICBnZXRMYXN0RnJhbWVOYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZyYW1lTmFtZSh0aGlzLmZyYW1lc0NvdW50IC0gMSk7XG4gIH1cblxuICB0cmlnZ2VyT25BbmltYXRpb25FbmQoKSB7XG4gICAgdGhpcy5vbkFuaW1hdGlvbkVuZExpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKHRoaXMpKTtcbiAgfVxuXG4gIHJlbmRlcihjb250ZXh0LCBkZWx0YVRpbWUpIHtcbiAgICBpZih0aGlzLmxvb3AgfHwgdGhpcy5mcmFtZUluZGV4ICsgMSA8IHRoaXMuZnJhbWVzQ291bnQpIHtcbiAgICAgIHRoaXMuZnJhbWVJbmRleCA9IE1hdGguZmxvb3IodGhpcy5lbGFwc2VkVGltZSAvIHRoaXMuZnJhbWVUaW1lKSAlIHRoaXMuZnJhbWVzQ291bnQ7XG4gICAgICB0aGlzLmVsYXBzZWRUaW1lICs9IGRlbHRhVGltZTtcbiAgICB9IGVsc2UgaWYoIXRoaXMuZW5kZWQpIHtcbiAgICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgICAgdGhpcy50cmlnZ2VyT25BbmltYXRpb25FbmQoKTtcbiAgICB9XG5cbiAgICBpZighdGhpcy52aXNpYmxlKSByZXR1cm47XG5cbiAgICBjb25zdCBmcmFtZSA9IHRoaXMuZnJhbWVzW3RoaXMuZnJhbWVJbmRleCB8fCAwXTtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShcbiAgICAgIGZyYW1lW3RoaXMudHJhbnNmb3JtSW5kZXhdLFxuICAgICAgdGhpcy5wb3MueCAqIGNvbmZpZy5ncmlkLnNpemUsXG4gICAgICB0aGlzLnBvcy55ICogY29uZmlnLmdyaWQuc2l6ZVxuICAgICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IGNhc3RBcnJheSB9IGZyb20gJy4vbGlicy91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhY2tncm91bmQge1xuICBjb25zdHJ1Y3RvcihpbWFnZXMpIHtcbiAgICB0aGlzLmltYWdlcyA9IGNhc3RBcnJheShpbWFnZXMpO1xuICB9XG5cbiAgcmVuZGVyKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltYWdlc1swXSwgMCwgMCk7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcuanMnO1xuXG5pbXBvcnQgeyBjYXN0QXJyYXkgfSBmcm9tICcuL2xpYnMvdXRpbHMnO1xuaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4vbGlicy9tYXRoJztcblxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuL0FuaW1hdGlvbic7XG5pbXBvcnQgQmFja2dyb3VuZCBmcm9tICcuL0JhY2tncm91bmQnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4vUmFuZ2UnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrZ3JvdW5kTWFwIHtcblxuICBjb25zdHJ1Y3RvcihiYWNrZ3JvdW5kc1NwZWMsIHRpbGVzTWFwKSB7XG4gICAgdGhpcy5zaXplID0gbmV3IFZlYzIoY29uZmlnLnNjcmVlbi53aWR0aCwgY29uZmlnLnNjcmVlbi5oZWlnaHQpO1xuICAgIHRoaXMuYmFja2dyb3VuZEltYWdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmFuaW1hdGlvbnNEYXRhID0gbmV3IE1hcCgpO1xuICAgIGJhY2tncm91bmRzU3BlYy5iYWNrZ3JvdW5kcy5mb3JFYWNoKGJnU3BlYyA9PiB0aGlzLl9jcmVhdGVCYWNrZ3JvdW5kKGJnU3BlYywgdGlsZXNNYXApKTtcbiAgICBiYWNrZ3JvdW5kc1NwZWMuYW5pbWF0aW9ucy5mb3JFYWNoKGFuaW1TcGVjID0+IHRoaXMuX2NyZWF0ZUFuaW1hdGlvbkRhdGEoYW5pbVNwZWMpKTtcbiAgfVxuXG4gIGdldChiZ05hbWUpIHtcbiAgICByZXR1cm4gbmV3IEJhY2tncm91bmQodGhpcy5iYWNrZ3JvdW5kSW1hZ2VzLmdldChiZ05hbWUpKTtcbiAgfVxuXG4gIGdldE5ld0FuaW1hdGlvbihhbmltTmFtZSkge1xuICAgIGNvbnN0IGFuaW1hdGlvbkRhdGEgPSB0aGlzLmFuaW1hdGlvbnNEYXRhLmdldChhbmltTmFtZSk7XG4gICAgcmV0dXJuIG5ldyBBbmltYXRpb24oYW5pbWF0aW9uRGF0YSk7XG4gIH1cblxuICBfY3JlYXRlQW5pbWF0aW9uRGF0YShhbmltU3BlYykge1xuICAgIGNvbnN0IGZyYW1lcyA9IGFuaW1TcGVjLmZyYW1lcy5tYXAoYmdOYW1lID0+IHRoaXMuYmFja2dyb3VuZEltYWdlcy5nZXQoYmdOYW1lKSk7XG4gICAgdGhpcy5hbmltYXRpb25zRGF0YS5zZXQoYW5pbVNwZWMubmFtZSwge1xuICAgICAgZnJhbWVzLFxuICAgICAgZnJhbWVUaW1lOiBhbmltU3BlYy5mcmFtZVRpbWVcbiAgICB9KTtcbiAgfVxuXG4gIF9jcmVhdGVCYWNrZ3JvdW5kKGJnU3BlYywgdGlsZXNNYXApIHtcbiAgICAvLyBCdWZmZXIgaW5pdGlhbGl6ZVxuICAgIGNvbnN0IGJ1ZmZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGJ1ZmZlci53aWR0aCA9IHRoaXMuc2l6ZS54O1xuICAgIGJ1ZmZlci5oZWlnaHQgPSB0aGlzLnNpemUueTtcblxuICAgIC8vIEZpbGwgYnVmZmVyIHdpdGggZGVmaW5lZCBjb2xvclxuICAgIGNvbnN0IGNvbnRleHQgPSBidWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB0aGlzLl9maWxsQnVmZmVyKGNvbnRleHQsIGJnU3BlYy5jb2xvcik7XG5cbiAgICAvLyBEcmF3IHRpbGVzTWFwIGludG8gdGhlIGJ1ZmZlclxuICAgIGJnU3BlYy5maWxsLmZvckVhY2godGhpcy5fZHJhd1RvQnVmZmVyKGNvbnRleHQsIHRpbGVzTWFwKSk7XG5cbiAgICAvLyBTYXZlIGJhY2tncm91bmRzXG4gICAgdGhpcy5iYWNrZ3JvdW5kSW1hZ2VzLnNldChiZ1NwZWMubmFtZSwgYnVmZmVyKTtcbiAgfVxuXG4gIF9maWxsQnVmZmVyKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLnNpemUueCwgdGhpcy5zaXplLnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIDEpJztcbiAgICB9XG4gIH1cblxuICBfZHJhd1RvQnVmZmVyKGNvbnRleHQsIHRpbGVzTWFwKSB7XG4gICAgZnVuY3Rpb24gbm9ybWFsaXplUmFuZ2UoZm4pIHtcbiAgICAgIHJldHVybiByYW5nZSA9PiB7XG4gICAgICAgIHJhbmdlID0gQXJyYXkuaXNBcnJheShyYW5nZSkgPyByYW5nZSA6IFtyYW5nZSwgcmFuZ2VdO1xuICAgICAgICBmbihuZXcgUmFuZ2UocmFuZ2VbMF0sIHJhbmdlWzFdKSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdUaWxlKHJhbmdlWCwgcmFuZ2VZLCB7IHN0ZXAsIG5hbWVzLCBuYW1lSW5kZXgsIGluZGV4IH0pIHtcbiAgICAgIHJhbmdlWC5mb3JFYWNoKHggPT4ge1xuICAgICAgICByYW5nZVkuZm9yRWFjaCh5ID0+IHtcbiAgICAgICAgICBsZXQgc3ByaXRlTmFtZSA9IG5hbWVzW25hbWVJbmRleCsrICUgbmFtZXMubGVuZ3RoXTtcbiAgICAgICAgICB0aWxlc01hcC5kcmF3KHNwcml0ZU5hbWUsIGNvbnRleHQsIG5ldyBWZWMyKHgsIHkpLCBpbmRleCB8fCAwKTtcbiAgICAgICAgfSwgc3RlcC55KTtcbiAgICAgIH0sIHN0ZXAueCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGxTcGVjID0+IHtcbiAgICAgIGNvbnN0IGZpbGxDeHQgPSB7XG4gICAgICAgIG5hbWVzOiBjYXN0QXJyYXkoZmlsbFNwZWMuc3ByaXRlTmFtZSksXG4gICAgICAgIG5hbWVJbmRleDogMCxcbiAgICAgICAgaW5kZXg6IGZpbGxTcGVjLmluZGV4XG4gICAgICB9O1xuXG4gICAgICAvLyBQcm9jZXNzIHJhbmdlc1xuICAgICAgZmlsbFNwZWMucmFuZ2VzLmZvckVhY2gocmFuZ2UgPT4ge1xuICAgICAgICBmaWxsQ3h0LnN0ZXAgPSBuZXcgVmVjMihyYW5nZS5zdGVwWCB8fCAxLCByYW5nZS5zdGVwWSB8fCAxKTtcbiAgICAgICAgLy8gUHJvY2VzcyBYIHJhbmdlXG4gICAgICAgIHJhbmdlLnguZm9yRWFjaChcbiAgICAgICAgICBub3JtYWxpemVSYW5nZShyYW5nZVggPT4ge1xuICAgICAgICAgICAgLy8gUHJvY2VzcyBZIHJhbmdlXG4gICAgICAgICAgICByYW5nZS55LmZvckVhY2goXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZVJhbmdlKHJhbmdlWSA9PiB7XG4gICAgICAgICAgICAgICAgZHJhd1RpbGUocmFuZ2VYLCByYW5nZVksIGZpbGxDeHQpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufVxuIiwiXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCZWhhdmlvciB7XG5cbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5vblN0YXJ0TGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMub25FbmRMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICB0cmlnZ2VyT25TdGFydChkYXRhKSB7XG4gICAgdGhpcy5vblN0YXJ0TGlzdGVuZXJzLmZvckVhY2goaGFuZGxlciA9PiBoYW5kbGVyKGRhdGEpKTtcbiAgfVxuXG4gIHRyaWdnZXJPbkVuZChkYXRhKSB7XG4gICAgdGhpcy5vbkVuZExpc3RlbmVycy5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlcihkYXRhKSk7XG4gIH1cblxuICB1cGRhdGUoZW50aXR5LCBkZWx0YVRpbWUpIHtcbiAgICBjb25zb2xlLmluZm8oJ1VwZGF0ZSBub3QgaW1wbGVtZW50ZWQhJyk7XG4gIH1cbn1cbiIsImltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5pbXBvcnQgeyBMRUZULCBSSUdIVCwgVVAsIERPV04gfSBmcm9tICcuL2JlaGF2aW9ycy9KdW1wJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuL2xpYnMvbWF0aCc7XG5cbmNvbnN0IGJsb2NrU2l6ZSA9IDMgKiBjb25maWcuZ3JpZC5zaXplO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCbG9jayB7XG4gIGNvbnN0cnVjdG9yKGluaXRpYWxTcHJpdGVOYW1lLCB0aWxlc01hcCwgcG9zID0gbmV3IFZlYzIoMCwgMCkpIHtcbiAgICB0aGlzLmN1cnJlbnRTcHJpdGVOYW1lID0gaW5pdGlhbFNwcml0ZU5hbWU7XG4gICAgdGhpcy50aWxlc01hcCA9IHRpbGVzTWFwO1xuICAgIHRoaXMucG9zID0gcG9zLmNsb25lKCk7XG4gICAgdGhpcy5vblJvdGF0ZUVuZEhhbmRsZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuY2xlYXJlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2luaXRpYWxpemVBbmltYXRpb25zKCk7XG4gIH1cblxuICBhZGRSb3RhdGVFbmRIYW5kbGVyKGhhbmRsZXIpIHtcbiAgICB0aGlzLm9uUm90YXRlRW5kSGFuZGxlcnMuYWRkKGhhbmRsZXIpO1xuICB9XG5cbiAgdHJpZ2dlck9uUm90YXRlRW5kSGFuZGxlcigpIHtcbiAgICB0aGlzLm9uUm90YXRlRW5kSGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIodGhpcykpO1xuICB9XG5cbiAgbWFya0FzQ2xlYXJlZCgpIHtcbiAgICB0aGlzLmNsZWFyZWQgPSB0cnVlO1xuICAgIHRoaXMuY3VycmVudEJsb2NrQW5pbSA9IHRoaXMudGlsZXNNYXAubmV3U3ByaXRlKFwiYmwtY2xlYXJlZFwiLCB0aGlzLnBvcyk7XG4gIH1cblxuICByb3RhdGUoZGlyZWN0aW9uKSB7XG4gICAgaWYodGhpcy5jbGVhcmVkKSByZXR1cm47XG4gICAgdGhpcy5jdXJyZW50QmxvY2tBbmltID0gdGhpcy5ibG9ja0FuaW1NYXAuZ2V0KGAke3RoaXMuY3VycmVudFNwcml0ZU5hbWV9LSR7ZGlyZWN0aW9uLnl9LSR7ZGlyZWN0aW9uLnh9YCk7XG4gICAgdGhpcy5jdXJyZW50QmxvY2tBbmltLnBvcy5zZXQodGhpcy5wb3MueCwgdGhpcy5wb3MueSk7XG4gICAgdGhpcy5jdXJyZW50U3ByaXRlTmFtZSA9IHRoaXMuY3VycmVudEJsb2NrQW5pbS5nZXRMYXN0RnJhbWVOYW1lKCk7XG4gICAgdGhpcy5jdXJyZW50QmxvY2tBbmltLnBsYXkoKTtcbiAgfVxuXG4gIHJlbmRlcihjb250ZXh0LCBkZWx0YVRpbWUpIHtcbiAgICBjb250ZXh0LmNsZWFyUmVjdChcbiAgICAgIHRoaXMucG9zLnggKiBjb25maWcuZ3JpZC5zaXplLFxuICAgICAgdGhpcy5wb3MueSAqIGNvbmZpZy5ncmlkLnNpemUsXG4gICAgICBibG9ja1NpemUsXG4gICAgICBibG9ja1NpemVcbiAgICApO1xuXG4gICAgaWYodGhpcy5jdXJyZW50QmxvY2tBbmltKSB7XG4gICAgICB0aGlzLmN1cnJlbnRCbG9ja0FuaW0ucmVuZGVyKGNvbnRleHQsIGRlbHRhVGltZSk7XG4gICAgfVxuICB9XG5cbiAgX2luaXRpYWxpemVBbmltYXRpb25zKCkge1xuICAgIGxldCBibG9ja3NTcGVjID0gW1xuICAgICAgW2BibDEtZi0ke1VQfS0ke1JJR0hUfWAgICwgJ2JsMS1mLXUnXSxcbiAgICAgIFtgYmwxLWYtJHtET1dOfS0ke0xFRlR9YCAsICdibDEtZi1kJ10sXG4gICAgICBbYGJsMS1mLSR7VVB9LSR7TEVGVH1gICAgLCAnYmwxLWYtbCddLFxuICAgICAgW2BibDEtZi0ke0RPV059LSR7UklHSFR9YCwgJ2JsMS1mLXInXSxcblxuICAgICAgW2BibDEtci0ke1VQfS0ke1JJR0hUfWAgICwgJ2JsMS1yLXUnXSxcbiAgICAgIFtgYmwxLXItJHtET1dOfS0ke0xFRlR9YCAsICdibDEtci1kJ10sXG4gICAgICBbYGJsMS1yLSR7VVB9LSR7TEVGVH1gICAgLCAnYmwxLXItbCddLFxuICAgICAgW2BibDEtci0ke0RPV059LSR7UklHSFR9YCwgJ2JsMS1yLXInXSxcblxuICAgICAgW2BibDEtdC0ke1VQfS0ke1JJR0hUfWAgICwgJ2JsMS10LXUnXSxcbiAgICAgIFtgYmwxLXQtJHtET1dOfS0ke0xFRlR9YCAsICdibDEtdC1kJ10sXG4gICAgICBbYGJsMS10LSR7VVB9LSR7TEVGVH1gICAgLCAnYmwxLXQtbCddLFxuICAgICAgW2BibDEtdC0ke0RPV059LSR7UklHSFR9YCwgJ2JsMS10LXInXSxcbiAgICBdO1xuXG4gICAgdGhpcy5ibG9ja0FuaW1NYXAgPSBuZXcgTWFwKCk7XG4gICAgYmxvY2tzU3BlYy5mb3JFYWNoKGJsb2NrU3BlYyA9PiB7XG4gICAgICBsZXQgYmxvY2tBbmltID0gdGhpcy50aWxlc01hcC5uZXdBbmltYXRpb24oYmxvY2tTcGVjWzFdKTtcbiAgICAgIGJsb2NrQW5pbS5vbkFuaW1hdGlvbkVuZExpc3RlbmVycy5hZGQoKCkgPT4ge1xuICAgICAgICB0aGlzLnRyaWdnZXJPblJvdGF0ZUVuZEhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5ibG9ja0FuaW1NYXAuc2V0KGJsb2NrU3BlY1swXSwgYmxvY2tBbmltKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcG9zaXRvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudXBkYXRhYmxlTGF5ZXJzID0gW107XG4gICAgdGhpcy5sYXllcnMgPSBbXTtcbiAgfVxuXG4gIGFkZExheWVyKGxheWVyKSB7XG4gICAgaWYobGF5ZXIudXBkYXRlKSB0aGlzLnVwZGF0YWJsZUxheWVycy5wdXNoKGxheWVyKTtcbiAgICB0aGlzLmxheWVycy5wdXNoKGxheWVyKTtcbiAgfVxuXG4gIHVwZGF0ZSh0aW1lKSB7XG4gICAgdGhpcy51cGRhdGFibGVMYXllcnMuZm9yRWFjaChsYXllciA9PiBsYXllci51cGRhdGUodGltZSkpO1xuICB9XG5cbiAgcmVuZGVyKGNvbnRleHQsIHRpbWUpIHtcbiAgICB0aGlzLmxheWVycy5mb3JFYWNoKGxheWVyID0+IGxheWVyLnJlbmRlcihjb250ZXh0LCB0aW1lKSk7XG4gIH1cbn1cbiIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW50aXR5IHtcblxuICBjb25zdHJ1Y3Rvcihwb3MpIHtcbiAgICB0aGlzLmJlaGF2aW9ycyA9IFtdO1xuICAgIHRoaXMudHJhbnNmb3JtSW5kZXggPSAwO1xuICAgIHRoaXMucG9zID0gcG9zLmNsb25lKCk7XG4gIH1cblxuICBhZGRCZWhhdmlvcihiZWhhdmlvcikge1xuICAgIHRoaXMuYmVoYXZpb3JzLnB1c2goYmVoYXZpb3IpO1xuICAgIHRoaXNbYmVoYXZpb3IubmFtZV0gPSBiZWhhdmlvcjtcbiAgfVxuXG4gIHVwZGF0ZShkZWx0YVRpbWUpIHtcbiAgICB0aGlzLmJlaGF2aW9ycy5mb3JFYWNoKGJlaGF2aW9yID0+IGJlaGF2aW9yLnVwZGF0ZSh0aGlzLCBkZWx0YVRpbWUpKTtcbiAgICBpZih0aGlzLnNwcml0ZSlcbiAgICAgIHRoaXMuc3ByaXRlLnBvcy5zZXQodGhpcy5wb3MueCwgdGhpcy5wb3MueSk7XG4gIH1cblxuICByZW5kZXIoY29udGV4dCwgZGVsdGFUaW1lKSB7XG4gICAgaWYodGhpcy5zcHJpdGUpXG4gICAgICB0aGlzLnNwcml0ZS5yZW5kZXIoY29udGV4dCwgZGVsdGFUaW1lLCB0aGlzLnRyYW5zZm9ybUluZGV4KTtcbiAgfVxuXG4gIF9zZXRDdXJyZW50U3ByaXRlKG5hbWUpIHtcbiAgICB0aGlzLnNwcml0ZSA9IHRoaXMuc3ByaXRlc1tuYW1lXTtcbiAgfVxufVxuIiwiY29uc3QgUFJFU1NFRCA9IDE7XG5jb25zdCBSRUxFQVNFRCA9IDA7XG5cbmV4cG9ydCBjb25zdCBLZXlzID0ge1xuICBTcGFjZTogJ1NwYWNlJyxcbiAgQXJyb3dVcDogJ0Fycm93VXAnLFxuICBBcnJvd0Rvd246ICdBcnJvd0Rvd24nLFxuICBBcnJvd0xlZnQ6ICdBcnJvd0xlZnQnLFxuICBBcnJvd1JpZ2h0OiAnQXJyb3dSaWdodCcsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXlib2FyZCB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5rZXlTdGF0ZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5rZXlMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBhZGRLZXlMaXN0ZW5lcihrZXlDb2RlLCBjYWxsYmFjaykge1xuICAgIHRoaXMua2V5TGlzdGVuZXJzLnNldChrZXlDb2RlLCBjYWxsYmFjayk7XG4gIH1cblxuICBzdGFydExpc3RlbmluZ1RvKGV2ZW50U291cmNlKSB7XG4gICAgLy8gQXR0YWNoIHRvIHRoZSBrZXkgZG93biBhbmQgdXAgZXZlbnRzLlxuICAgIFsna2V5ZG93bicsICdrZXl1cCddLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgIGV2ZW50U291cmNlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBldmVudCA9PiB0aGlzLl9oYW5kbGVFdmVudChldmVudCkpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXRMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5rZXlMaXN0ZW5lcnMuY2xlYXIoKTtcbiAgICB0aGlzLmtleVN0YXRlcy5jbGVhcigpO1xuICB9XG5cbiAgZ2V0S2V5U3RhdGUoa2V5Q29kZSkge1xuICAgIHJldHVybiB0aGlzLmtleVN0YXRlcy5nZXQoa2V5Q29kZSk7XG4gIH1cblxuICBfaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBrZXlDb2RlID0gZXZlbnQuY29kZTtcblxuICAgIC8vIENoZWNrcyBpZiB0aGVyZSBpcyBhIGxpc3RlbmVyIGZvciB0aGUgcHJlc3NlZCBrZXlcbiAgICBpZighdGhpcy5rZXlMaXN0ZW5lcnMuaGFzKGtleUNvZGUpKSByZXR1cm47XG5cbiAgICAvLyBQcmV2ZW50IHRoZSBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3JcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gQ2hlY2tzIGlmIHRoZSBrZXkgd2FzIGFscmVhZHkgaW4gdGhlIHN0YXRlXG4gICAgY29uc3Qga2V5U3RhdGUgPSBldmVudC50eXBlID09PSAna2V5ZG93bicgPyBQUkVTU0VEIDogUkVMRUFTRUQ7XG4gICAgaWYodGhpcy5rZXlTdGF0ZXMuZ2V0KGtleUNvZGUpID09PSBrZXlTdGF0ZSkgcmV0dXJuO1xuXG4gICAgLy8gU2F2ZSB0aGUgY3VycmVudCBrZXkgc3RhdGUgYW5kIHRyaWdnZXIgdGhlIGxpc3RlbmVyIGNhbGxiYWNrXG4gICAgdGhpcy5rZXlTdGF0ZXMuc2V0KGtleUNvZGUsIGtleVN0YXRlKTtcbiAgICB0aGlzLmtleUxpc3RlbmVycy5nZXQoa2V5Q29kZSkoa2V5U3RhdGUsIHRoaXMpO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5ZXIge1xuXG4gIGNvbnN0cnVjdG9yKHBvcywgc2l6ZSkge1xuICAgIC8vIEluaXRpYWxpemUgcHJvcGVydGllc1xuICAgIHRoaXMucG9zID0gcG9zLmNsb25lKCk7XG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICB0aGlzLnNwcml0ZXMgPSBbXTtcbiAgICAvLyBJbml0aWFsaXplIGJ1ZmZlclxuICAgIHRoaXMuYnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy5idWZmZXIud2lkdGggPSBzaXplLndpZHRoO1xuICAgIHRoaXMuYnVmZmVyLmhlaWdodCA9IHNpemUuaGVpZ2h0O1xuICAgIHRoaXMuY29udGV4dCA9IHRoaXMuYnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG4gIH1cblxuICBhZGRTcHJpdGUoc3ByaXRlKSB7XG4gICAgdGhpcy5zcHJpdGVzLnB1c2goc3ByaXRlKTtcbiAgfVxuXG4gIHVwZGF0ZShkZWx0YVRpbWUpIHtcbiAgICB0aGlzLnNwcml0ZXMuZm9yRWFjaChzcHJpdGUgPT4gc3ByaXRlLnVwZGF0ZShkZWx0YVRpbWUpKTtcbiAgfVxuXG4gIHJlbmRlcihjb250ZXh0LCBkZWx0YVRpbWUpIHtcbiAgICB0aGlzLl9jbGVhcigpO1xuICAgIHRoaXMuX3JlbmRlclNwcml0ZXMoZGVsdGFUaW1lKTtcbiAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmJ1ZmZlciwgdGhpcy5wb3MueCAqIGNvbmZpZy5ncmlkLnNpemUsIHRoaXMucG9zLnkgKiBjb25maWcuZ3JpZC5zaXplKTtcbiAgfVxuXG4gIF9jbGVhcigpIHtcbiAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuYnVmZmVyLndpZHRoLCB0aGlzLmJ1ZmZlci5oZWlnaHQpO1xuICB9XG5cbiAgX3JlbmRlclNwcml0ZXMoZGVsdGFUaW1lKSB7XG4gICAgdGhpcy5zcHJpdGVzLmZvckVhY2goc3ByaXRlID0+IHtcbiAgICAgIHNwcml0ZS5yZW5kZXIodGhpcy5jb250ZXh0LCBkZWx0YVRpbWUpO1xuICAgIH0pXG4gIH1cbn1cbiIsImltcG9ydCBTdGFnZSBmcm9tIFwiLi9TdGFnZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXZlbCB7XG5cbiAgY29uc3RydWN0b3IobGV2ZWxTcGVjLCB0aWxlc01hcCwgY2hhcmFjdGVyc01hcCwgaW5wdXQpIHtcbiAgICB0aGlzLmxldmVsU3BlYyA9IGxldmVsU3BlYztcbiAgICB0aGlzLnRpbGVzTWFwID0gdGlsZXNNYXA7XG4gICAgdGhpcy5jaGFyYWN0ZXJzTWFwID0gY2hhcmFjdGVyc01hcDtcbiAgICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gICAgdGhpcy5jdXJyZW50U3RhZ2U7XG4gIH1cblxuICBnZXRTdGFnZShzdGFnZU51bWJlcikge1xuICAgIHRoaXMuaW5wdXQucmVzZXRMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmN1cnJlbnRTdGFnZSA9IG5ldyBTdGFnZShcbiAgICAgIHRoaXMubGV2ZWxTcGVjLnN0YWdlc1tgc3RhZ2Uke3N0YWdlTnVtYmVyfWBdLFxuICAgICAgdGhpcy50aWxlc01hcCxcbiAgICAgIHRoaXMuY2hhcmFjdGVyc01hcCxcbiAgICAgIHRoaXMuaW5wdXRcbiAgICApO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdGFnZTtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmFuZ2Uge1xuICBjb25zdHJ1Y3RvcihzdGFydCwgZW5kKSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZW5kID0gZW5kO1xuICB9XG5cbiAgZm9yRWFjaChmbiwgc3RlcCA9IDEpIHtcbiAgICBmb3IgKGxldCB2YWx1ZSA9IHRoaXMuc3RhcnQ7IHZhbHVlIDw9IHRoaXMuZW5kOyB2YWx1ZSArPSBzdGVwKSB7XG4gICAgICBmbih2YWx1ZSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi9saWJzL21hdGgnO1xuaW1wb3J0IHsgY2FzdEFycmF5IH0gZnJvbSAnLi9saWJzL3V0aWxzJztcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi9BbmltYXRpb24nO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwcml0ZSB7XG5cbiAgY29uc3RydWN0b3Ioc3ByaXRlRGF0YSwgcG9zID0gbmV3IFZlYzIoMCwgMCkpIHtcbiAgICBpZihzcHJpdGVEYXRhLmZyYW1lcykge1xuICAgICAgdGhpcy5hbmltYXRpb24gPSBzcHJpdGVEYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmltYWdlcyA9IGNhc3RBcnJheShzcHJpdGVEYXRhKTtcbiAgICB9XG4gICAgdGhpcy5wb3MgPSBwb3MuY2xvbmUoKTtcbiAgfVxuXG4gIHJlbmRlcihjb250ZXh0LCBkZWx0YVRpbWUsIHRyYW5zZm9ybUluZGV4ID0gMCkge1xuICAgIGlmKHRoaXMuYW5pbWF0aW9uKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvbi5yZW5kZXIoY29udGV4dCwgZGVsdGFUaW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYodHJhbnNmb3JtSW5kZXggPj0gdGhpcy5pbWFnZXMubGVuZ3RoKVxuICAgICAgICB0cmFuc2Zvcm1JbmRleCA9IDA7XG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShcbiAgICAgICAgdGhpcy5pbWFnZXNbdHJhbnNmb3JtSW5kZXhdLFxuICAgICAgICB0aGlzLnBvcy54ICogY29uZmlnLmdyaWQuc2l6ZSxcbiAgICAgICAgdGhpcy5wb3MueSAqIGNvbmZpZy5ncmlkLnNpemVcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi9saWJzL21hdGgnO1xuaW1wb3J0IHsgZGVnVG9SYWQgfSBmcm9tICcuL2xpYnMvbWF0aCc7XG5pbXBvcnQgeyBjYXN0QXJyYXkgfSBmcm9tICcuL2xpYnMvdXRpbHMnO1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBTcHJpdGUgZnJvbSAnLi9TcHJpdGUnO1xuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuL0FuaW1hdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwcml0ZU1hcCB7XG5cbiAgY29uc3RydWN0b3Ioc3ByaXRlc1NwZWMsIHNwcml0ZUltYWdlTWFwKSB7XG4gICAgdGhpcy5zcHJpdGVJbWFnZU1hcCA9IHNwcml0ZUltYWdlTWFwO1xuICAgIHRoaXMuaW1hZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuYW5pbWF0aW9uc0RhdGEgPSBuZXcgTWFwKCk7XG4gICAgc3ByaXRlc1NwZWMuc3ByaXRlcy5mb3JFYWNoKHNwcml0ZVNwZWMgPT4gdGhpcy5fY3JlYXRlU3ByaXRlQnVmZmVyKHNwcml0ZVNwZWMpKTtcbiAgICBjb25zdCBhbmltYXRpb25zU3BlYyA9IHNwcml0ZXNTcGVjLmFuaW1hdGlvbnMgfHwgW107XG4gICAgYW5pbWF0aW9uc1NwZWMuZm9yRWFjaChhbmltU3BlYyA9PiB0aGlzLl9jcmVhdGVBbmltYXRpb25EYXRhKGFuaW1TcGVjKSk7XG4gIH1cblxuICBnZXRJbWFnZShpbWFnZU5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5pbWFnZXMuZ2V0KGltYWdlTmFtZSk7XG4gIH1cblxuICBnZXRBbmltYXRpb25EYXRhKGFuaW1hdGlvbk5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5hbmltYXRpb25zRGF0YS5nZXQoYW5pbWF0aW9uTmFtZSk7XG4gIH1cblxuICBuZXdTcHJpdGUoaW1hZ2VOYW1lLCBwb3MpIHtcbiAgICBjb25zdCBpbWFnZSA9IHRoaXMuZ2V0SW1hZ2UoaW1hZ2VOYW1lKTtcbiAgICByZXR1cm4gbmV3IFNwcml0ZShpbWFnZSwgcG9zKTtcbiAgfVxuXG4gIG5ld0FuaW1hdGlvbihhbmltYXRpb25OYW1lLCBwb3MpIHtcbiAgICBjb25zdCBhbmltYXRpb24gPSB0aGlzLmdldEFuaW1hdGlvbkRhdGEoYW5pbWF0aW9uTmFtZSk7XG4gICAgcmV0dXJuIG5ldyBBbmltYXRpb24oYW5pbWF0aW9uLCBwb3MpO1xuICB9XG5cbiAgZHJhdyhpbWFnZU5hbWUsIGNvbnRleHQsIHBvcyA9IG5ldyBWZWMyKDAsIDApLCB0cmFuc2Zvcm1JbmRleCA9IDApIHtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShcbiAgICAgIHRoaXMuZ2V0SW1hZ2UoaW1hZ2VOYW1lKVt0cmFuc2Zvcm1JbmRleF0sXG4gICAgICBwb3MueCAqIGNvbmZpZy5ncmlkLnNpemUsXG4gICAgICBwb3MueSAqIGNvbmZpZy5ncmlkLnNpemVcbiAgICApO1xuICB9XG5cbiAgX2NyZWF0ZUFuaW1hdGlvbkRhdGEoYW5pbVNwZWMpIHtcbiAgICBsZXQgZnJhbWVzSW1hZ2VzID0gYW5pbVNwZWMuZnJhbWVzLm1hcChcbiAgICAgIGZyYW1lTmFtZSA9PiB0aGlzLmdldEltYWdlKGZyYW1lTmFtZSlcbiAgICApO1xuICAgIHRoaXMuYW5pbWF0aW9uc0RhdGEuc2V0KGFuaW1TcGVjLm5hbWUsIHtcbiAgICAgIGZyYW1lc05hbWVzOiBhbmltU3BlYy5mcmFtZXMsXG4gICAgICBmcmFtZXM6IGZyYW1lc0ltYWdlcyxcbiAgICAgIGZyYW1lVGltZTogYW5pbVNwZWMuZnJhbWVUaW1lXG4gICAgfSk7XG4gIH1cblxuICBfY3JlYXRlU3ByaXRlQnVmZmVyKHNwcml0ZVNwZWMpIHtcbiAgICBjb25zdCBwb3MgPSBuZXcgVmVjMihzcHJpdGVTcGVjLnBvc2l0aW9uWzBdLCBzcHJpdGVTcGVjLnBvc2l0aW9uWzFdKTtcbiAgICBjb25zdCBzaXplID0gbmV3IFZlYzIoXG4gICAgICBzcHJpdGVTcGVjLnNpemVbMF0gKiBjb25maWcuZ3JpZC5zaXplLFxuICAgICAgc3ByaXRlU3BlYy5zaXplWzFdICogY29uZmlnLmdyaWQuc2l6ZVxuICAgICk7XG4gICAgY29uc3QgYnVmZmVycyA9IGNhc3RBcnJheShcbiAgICAgIHRoaXMuX2NyZWF0ZVRyYW5zZm9ybWVkQnVmZmVyKHBvcywgc2l6ZSwgc3ByaXRlU3BlYy50cmFuc2Zvcm1hdGlvbilcbiAgICApO1xuICAgIHRoaXMuaW1hZ2VzLnNldChzcHJpdGVTcGVjLm5hbWUsIGJ1ZmZlcnMpO1xuICB9XG5cbiAgX2NyZWF0ZVRyYW5zZm9ybWVkQnVmZmVyKHBvcywgc2l6ZSwgdHJhbnNmb3JtYXRpb24pIHtcbiAgICBzd2l0Y2ggKHRyYW5zZm9ybWF0aW9uKSB7XG4gICAgICBjYXNlICdyb3RhdGVkJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVJvdGF0ZWRCdWZmZXIocG9zLCBzaXplKTtcblxuICAgICAgY2FzZSAnZmxpcHBlZCc6XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVGbGlwcGVkKHBvcywgc2l6ZSk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVCdWZmZXIocG9zLCBzaXplKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlUm90YXRlZEJ1ZmZlcihwb3MsIHNpemUpIHtcbiAgICByZXR1cm4gWzAsIDkwLCAxODAsIDI3MF0ubWFwKHJvdGF0aW9uID0+XG4gICAgICB0aGlzLl9jcmVhdGVCdWZmZXIocG9zLCBzaXplLCB7IHJvdGF0aW9uIH0pXG4gICAgKTtcbiAgfVxuXG4gIF9jcmVhdGVGbGlwcGVkKHBvcywgc2l6ZSkge1xuICAgIHJldHVybiBbZmFsc2UsIHRydWVdLm1hcChmbGlwcGVkID0+XG4gICAgICB0aGlzLl9jcmVhdGVCdWZmZXIocG9zLCBzaXplLCB7IGZsaXBwZWQgfSlcbiAgICApO1xuICB9XG5cbiAgX2NyZWF0ZUJ1ZmZlcihwb3MsIHNpemUsIHsgcm90YXRpb24sIGZsaXBwZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgYnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY29uc3QgaXNSb3RhdGVkID0gcm90YXRpb24gPT09IDkwIHx8IHJvdGF0aW9uID09PSAyNzA7XG4gICAgY29uc3Qgc3ByaXRlU2l6ZSA9IHNpemUuY2xvbmUoKTtcbiAgICBpZiAoaXNSb3RhdGVkKSBzcHJpdGVTaXplLnN3YXAoKTtcbiAgICBidWZmZXIud2lkdGggPSBzcHJpdGVTaXplLng7XG4gICAgYnVmZmVyLmhlaWdodCA9IHNwcml0ZVNpemUueTtcblxuICAgIGNvbnN0IGNvbnRleHQgPSBidWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBpZiAoZmxpcHBlZCkge1xuICAgICAgY29udGV4dC5zY2FsZSgtMSwgMSk7XG4gICAgICBjb250ZXh0LnRyYW5zbGF0ZSgtc3ByaXRlU2l6ZS54LCAwKTtcbiAgICB9XG5cbiAgICBpZiAocm90YXRpb24pIHtcbiAgICAgIGxldCB0cmFuc1ggPSBpc1JvdGF0ZWQgJiYgcm90YXRpb24gPT09IDI3MCA/IDAgOiBzcHJpdGVTaXplLng7XG4gICAgICBsZXQgdHJhbnNZID0gaXNSb3RhdGVkICYmIHJvdGF0aW9uID09PSA5MCA/IDAgOiBzcHJpdGVTaXplLnk7XG4gICAgICBjb250ZXh0LnRyYW5zbGF0ZSh0cmFuc1gsIHRyYW5zWSk7XG4gICAgICBjb250ZXh0LnJvdGF0ZShkZWdUb1JhZChyb3RhdGlvbikpO1xuICAgIH1cblxuICAgIGNvbnRleHQuZHJhd0ltYWdlKFxuICAgICAgdGhpcy5zcHJpdGVJbWFnZU1hcCxcbiAgICAgIHBvcy54LCBwb3MueSxcbiAgICAgIHNpemUueCwgc2l6ZS55LFxuICAgICAgMCwgMCxcbiAgICAgIHNpemUueCwgc2l6ZS55XG4gICAgKTtcbiAgICByZXR1cm4gYnVmZmVyO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IFZlYzIsIE1hdHJpeCB9IGZyb20gJy4vbGlicy9tYXRoJztcbmltcG9ydCB7IGp1bXBXaXRoS2V5cyB9IGZyb20gJy4vbGlicy9iaW5kJztcbmltcG9ydCB7IGlzU3RhZ2VDbGVhcmVkLCBjcmVhdGVEaWVJZk91dE9mQm91bmRhcmllc0NhbGxCYWNrIH0gZnJvbSAnLi9saWJzL3N0YWdlJztcblxuaW1wb3J0IExheWVyIGZyb20gJy4vTGF5ZXInO1xuaW1wb3J0IEJsb2NrIGZyb20gJy4vQmxvY2snO1xuaW1wb3J0IFFiZXJ0IGZyb20gJy4vZW50aXRpZXMvUWJlcnQnO1xuaW1wb3J0IFBpbGwgZnJvbSAnLi9lbnRpdGllcy9QaWxsJztcblxuY29uc3QgZW50aXRpZXNMYXllclBvcyA9IG5ldyBWZWMyKDAuNSwgLTEuNCk7XG5cbmNvbnN0IHJlZkJsb2NrUG9zID0gbmV3IFZlYzIoMywgMyk7XG5jb25zdCBibG9ja3NQb3MgPSBuZXcgVmVjMihcbiAgY29uZmlnLmJsb2NrLnN0YXJ0UG9zaXRpb24ueCxcbiAgY29uZmlnLmJsb2NrLnN0YXJ0UG9zaXRpb24ueVxuKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhZ2Uge1xuXG4gIGNvbnN0cnVjdG9yKHN0YWdlU3BlYywgdGlsZXNNYXAsIGNoYXJhY3RlcnNNYXAsIGlucHV0KSB7XG4gICAgLy8gSW5pdGlhbGl6ZSBwcm9wZXJ0aWVzXG4gICAgdGhpcy50aWxlc01hcCA9IHRpbGVzTWFwO1xuICAgIHRoaXMuYmxvY2tzRGF0YSA9IG5ldyBNYXRyaXgoKTtcbiAgICB0aGlzLmVudGl0aWVzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuZW50aXRpZXNMYXllciA9IG5ldyBMYXllcihlbnRpdGllc0xheWVyUG9zLCBjb25maWcuc2NyZWVuKTtcbiAgICB0aGlzLmNsZWFyZWQgPSBmYWxzZTtcblxuICAgIC8vIENyZWF0ZSBlbnRpdGllc1xuICAgIGNvbnN0IHN0YXJ0UG9zID0gbmV3IFZlYzIoc3RhZ2VTcGVjLnN0YXJ0UG9zKTtcbiAgICB0aGlzLnFiZXJ0ID0gbmV3IFFiZXJ0KGNoYXJhY3RlcnNNYXAsIHN0YXJ0UG9zKTtcbiAgICB0aGlzLmVudGl0aWVzTGF5ZXIuYWRkU3ByaXRlKHRoaXMucWJlcnQpO1xuICAgIHRoaXMucWJlcnQuanVtcC5vbkVuZExpc3RlbmVycy5hZGQoY3JlYXRlRGllSWZPdXRPZkJvdW5kYXJpZXNDYWxsQmFjayh0aGlzLmJsb2Nrc0RhdGEpKTtcblxuICAgIHRoaXMuZW50aXRpZXNUZXN0KGNoYXJhY3RlcnNNYXApO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBzdGFnZVxuICAgIHRoaXMuX2luaXRpYWxpemVCdWZmZXIoKTtcbiAgICB0aGlzLl9pbml0aWFsaXplTGV2ZWxCbG9ja3Moc3RhZ2VTcGVjKTtcbiAgICB0aGlzLl9pbml0aWFsaXplUWJlcnRMaXN0ZW5lcnMoKTtcblxuICAgIC8vIEJpbmQga2V5c1xuICAgIGp1bXBXaXRoS2V5cyhpbnB1dCwgdGhpcy5xYmVydCk7XG5cbiAgICAvLyBFdmVudHMgbGlzdGVuZXJzXG4gICAgdGhpcy5vbkxldmVsQ2xlYXJlZExpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIC8vIEl0IHdpbGwgYmUgcmVtb3ZlZC4gT25seSBmb3IgdGVzdHMuXG4gIGVudGl0aWVzVGVzdChjaGFyYWN0ZXJzTWFwKSB7XG4gICAgY29uc3QgcGlsbCA9IG5ldyBQaWxsKGNoYXJhY3RlcnNNYXAsJ2dyZWVuJyk7XG4gICAgdGhpcy5lbnRpdGllc0xheWVyLmFkZFNwcml0ZShwaWxsKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHBpbGwuc3Bhd24uc3RhcnQobmV3IFZlYzIoMTIsIDUpKSwgMzAwMCk7XG4gICAgcGlsbC5qdW1wLm9uRW5kTGlzdGVuZXJzLmFkZChjcmVhdGVEaWVJZk91dE9mQm91bmRhcmllc0NhbGxCYWNrKHRoaXMuYmxvY2tzRGF0YSkpO1xuXG4gICAgY29uc3QgcGlsbDIgPSBuZXcgUGlsbChjaGFyYWN0ZXJzTWFwLCdiZWlnZScpO1xuICAgIHRoaXMuZW50aXRpZXNMYXllci5hZGRTcHJpdGUocGlsbDIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gcGlsbDIuc3Bhd24uc3RhcnQobmV3IFZlYzIoMTgsIDUpKSwgNjAwMCk7XG4gICAgcGlsbDIuanVtcC5vbkVuZExpc3RlbmVycy5hZGQoY3JlYXRlRGllSWZPdXRPZkJvdW5kYXJpZXNDYWxsQmFjayh0aGlzLmJsb2Nrc0RhdGEpKTtcblxuICAgIGNvbnN0IHBpbGwzID0gbmV3IFBpbGwoY2hhcmFjdGVyc01hcCwncmVkJyk7XG4gICAgdGhpcy5lbnRpdGllc0xheWVyLmFkZFNwcml0ZShwaWxsMyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiBwaWxsMy5zcGF3bi5zdGFydChuZXcgVmVjMigxMiwgNSkpLCAxMDAwMCk7XG4gICAgcGlsbDMuanVtcC5vbkVuZExpc3RlbmVycy5hZGQoY3JlYXRlRGllSWZPdXRPZkJvdW5kYXJpZXNDYWxsQmFjayh0aGlzLmJsb2Nrc0RhdGEpKTtcblxuICAgIGNvbnN0IHBpbGw0ID0gbmV3IFBpbGwoY2hhcmFjdGVyc01hcCwnYmx1ZScpO1xuICAgIHRoaXMuZW50aXRpZXNMYXllci5hZGRTcHJpdGUocGlsbDQpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gcGlsbDQuc3Bhd24uc3RhcnQobmV3IFZlYzIoMTgsIDUpKSwgMTUwMDApO1xuICAgIHBpbGw0Lmp1bXAub25FbmRMaXN0ZW5lcnMuYWRkKGNyZWF0ZURpZUlmT3V0T2ZCb3VuZGFyaWVzQ2FsbEJhY2sodGhpcy5ibG9ja3NEYXRhKSk7XG5cbiAgfVxuXG4gIHVwZGF0ZShkZWx0YVRpbWUpIHtcbiAgICB0aGlzLmVudGl0aWVzTGF5ZXIudXBkYXRlKGRlbHRhVGltZSk7XG4gIH1cblxuICByZW5kZXIoY29udGV4dCwgZGVsdGFUaW1lKSB7XG4gICAgaWYodGhpcy5jdXJyZW50QmxvY2spIHtcbiAgICAgIHRoaXMuY3VycmVudEJsb2NrLnJlbmRlcih0aGlzLmNvbnRleHQsIGRlbHRhVGltZSk7XG4gICAgfVxuICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuYnVmZmVyLCAwLCAwKTtcbiAgICB0aGlzLmVudGl0aWVzTGF5ZXIucmVuZGVyKGNvbnRleHQsIGRlbHRhVGltZSk7XG4gIH1cblxuICB0cmlnZ2VyT25MZXZlbENsZWFyZWQoKSB7XG4gICAgdGhpcy5vbkxldmVsQ2xlYXJlZExpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKCkpO1xuICB9XG5cbiAgX2luaXRpYWxpemVCdWZmZXIoKSB7XG4gICAgdGhpcy5idWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmJ1ZmZlci53aWR0aCA9IGNvbmZpZy5zY3JlZW4ud2lkdGg7XG4gICAgdGhpcy5idWZmZXIuaGVpZ2h0ID0gY29uZmlnLnNjcmVlbi5oZWlnaHQ7XG4gICAgdGhpcy5jb250ZXh0ID0gdGhpcy5idWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcbiAgfVxuXG4gIF9pbml0aWFsaXplTGV2ZWxCbG9ja3Moc3RhZ2VTcGVjKSB7XG4gICAgLy8gRHJhdyByZWZlcmVuY2UgYmxvY2sgaW50byB0aGUgc3RhZ2UgYnVmZmVyLlxuICAgIHRoaXMucmVmQmxvY2tOYW1lID0gc3RhZ2VTcGVjLnJlZkJsb2NrO1xuICAgIHRoaXMudGlsZXNNYXAuZHJhdyhzdGFnZVNwZWMucmVmQmxvY2ssIHRoaXMuY29udGV4dCwgcmVmQmxvY2tQb3MpO1xuXG4gICAgLy8gRHJhdyBzdGFnZSBibG9ja3MgaW50byB0aGUgc3RhZ2UgYnVmZmVyLlxuICAgIGxldCBwb3MgPSBibG9ja3NQb3MuY2xvbmUoKTtcbiAgICBzdGFnZVNwZWMuYmxvY2tzLmZvckVhY2gobGluZSA9PiB7XG4gICAgICBsaW5lLmZvckVhY2goYmxvY2tOYW1lID0+IHtcbiAgICAgICAgaWYoYmxvY2tOYW1lKSB7XG4gICAgICAgICAgdGhpcy5fY3JlYXRlQmxvY2soYmxvY2tOYW1lLCBwb3MpO1xuICAgICAgICB9XG4gICAgICAgIHBvcy5tb3ZlWChjb25maWcuYmxvY2suZGlzdGFuY2UuY29sdW1uKTtcbiAgICAgIH0pO1xuICAgICAgcG9zLnggPSBibG9ja3NQb3MueDtcbiAgICAgIHBvcy5tb3ZlWShjb25maWcuYmxvY2suZGlzdGFuY2UubGluZSk7XG4gICAgfSk7XG4gIH1cblxuICBfaW5pdGlhbGl6ZVFiZXJ0TGlzdGVuZXJzKCkge1xuICAgIC8vIEp1bXAgbGlzdGVuZXJzXG4gICAgdGhpcy5xYmVydC5qdW1wLm9uU3RhcnRMaXN0ZW5lcnMuYWRkKGRpcmVjdGlvbiA9PiB7XG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IHRoaXMuYmxvY2tzRGF0YS5nZXQodGhpcy5xYmVydC5wb3MueSwgdGhpcy5xYmVydC5wb3MueCk7XG4gICAgICB0aGlzLmN1cnJlbnRCbG9jay5yb3RhdGUoZGlyZWN0aW9uKTtcbiAgICB9KTtcbiAgICB0aGlzLnFiZXJ0Lmp1bXAub25FbmRMaXN0ZW5lcnMuYWRkKCgpID0+IHtcbiAgICAgIGlmKHRoaXMuY2xlYXJlZCkge1xuICAgICAgICB0aGlzLnFiZXJ0Lndpbi5zdGFydCgzKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyT25MZXZlbENsZWFyZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIERpZSBwcm9jZXNzIGxpc3RlbmVyXG4gICAgdGhpcy5xYmVydC5kaWUub25FbmRMaXN0ZW5lcnMuYWRkKCgpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5xYmVydC5zcGF3bi5zdGFydChuZXcgVmVjMigxNSwgMykpLCA1MDApO1xuICAgIH0pO1xuXG4gICAgLy8gU3Bhd24gcHJvY2Vzc1xuICAgIHRoaXMucWJlcnQuc3Bhd24ub25FbmRMaXN0ZW5lcnMuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMucWJlcnQuanVtcC5lbmFibGUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9jcmVhdGVCbG9jayhibG9ja05hbWUsIHBvcykge1xuICAgIGxldCBibG9jayA9IG5ldyBCbG9jayhibG9ja05hbWUsIHRoaXMudGlsZXNNYXAsIHBvcyk7XG4gICAgYmxvY2suYWRkUm90YXRlRW5kSGFuZGxlcigoYmxvY2spID0+IHRoaXMuX2NoZWNrQmxvY2soYmxvY2spKTtcbiAgICB0aGlzLmJsb2Nrc0RhdGEuc2V0KHBvcy55LCBwb3MueCwgYmxvY2spO1xuICAgIHRoaXMudGlsZXNNYXAuZHJhdyhibG9ja05hbWUsIHRoaXMuY29udGV4dCwgcG9zKTtcbiAgfVxuXG4gIF9jaGVja0Jsb2NrKGJsb2NrKSB7XG4gICAgaWYoYmxvY2suY3VycmVudFNwcml0ZU5hbWUgPT09IHRoaXMucmVmQmxvY2tOYW1lKSB7XG4gICAgICBibG9jay5tYXJrQXNDbGVhcmVkKCk7XG4gICAgICBpZihpc1N0YWdlQ2xlYXJlZCh0aGlzLmJsb2Nrc0RhdGEsIGJsb2NrKSkge1xuICAgICAgICB0aGlzLmNsZWFyZWQgPSB0cnVlO1xuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVyIHtcbiAgY29uc3RydWN0b3IoZGVsdGFUaW1lID0gMSAvIDYwKSB7XG4gICAgbGV0IGxhc3RUaW1lID0gMDtcbiAgICBsZXQgYWNjdW11bGF0ZWRUaW1lID0gMDtcblxuICAgIHRoaXMudXBkYXRlUHJveHkgPSB0aW1lID0+IHtcbiAgICAgIGFjY3VtdWxhdGVkVGltZSArPSAodGltZSAtIGxhc3RUaW1lKSAvIDEwMDA7XG5cbiAgICAgIHdoaWxlIChhY2N1bXVsYXRlZFRpbWUgPiBkZWx0YVRpbWUpIHtcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlKSB0aGlzLnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgICAgICBhY2N1bXVsYXRlZFRpbWUgLT0gZGVsdGFUaW1lO1xuICAgICAgfVxuICAgICAgbGFzdFRpbWUgPSB0aW1lO1xuICAgICAgdGhpcy5lbnF1ZXVlKCk7XG4gICAgfTtcbiAgfVxuXG4gIGVucXVldWUoKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlUHJveHkpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5lbnF1ZXVlKCk7XG4gIH1cbn1cbiIsImltcG9ydCBCZWhhdmlvciBmcm9tICcuLi9CZWhhdmlvcic7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZSBleHRlbmRzIEJlaGF2aW9yIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcignZGllJyk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMuc3BlZWQgPSAxMjtcblxuICAgIHRoaXMub25TdGFydExpc3RlbmVycy5hZGQoZW50aXR5ID0+IHtcbiAgICAgIGlmKGVudGl0eS5qdW1wICYmIGVudGl0eS5qdW1wLmlzRW5hYmxlZCkge1xuICAgICAgICBlbnRpdHkuanVtcC5kaXNhYmxlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBpZih0aGlzLmlzQWN0aXZlKCkpIHJldHVybjtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5pc0R5aW5nID0gdHJ1ZTtcbiAgfVxuXG4gIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLmlzRHlpbmc7XG4gIH1cblxuICB1cGRhdGUoZW50aXR5LCBkZWx0YVRpbWUpIHtcbiAgICB0aGlzLl9keWluZ1VwZGF0ZShlbnRpdHkpO1xuICAgIGlmKHRoaXMuaXNEeWluZykge1xuICAgICAgdGhpcy5fbW92ZShlbnRpdHksIGRlbHRhVGltZSk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5pc0R5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIF9tb3ZlKGVudGl0eSwgZGVsdGFUaW1lKSB7XG4gICAgdGhpcy5wb3NpdGlvbi5tb3ZlWSh0aGlzLnNwZWVkICogZGVsdGFUaW1lKTtcbiAgICBlbnRpdHkucG9zLnNldFkodGhpcy5wb3NpdGlvbi55KTtcbiAgfVxuXG4gIF9keWluZ1VwZGF0ZShlbnRpdHkpIHtcbiAgICBpZighdGhpcy5pc0R5aW5nKSByZXR1cm47XG5cbiAgICBpZighdGhpcy5wb3NpdGlvbikge1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IGVudGl0eS5wb3M7XG4gICAgICB0aGlzLnRyaWdnZXJPblN0YXJ0KGVudGl0eSk7XG4gICAgfVxuICAgIGlmKGVudGl0eS5wb3MueSA+PSBjb25maWcuZ3JpZC5saW5lcyArIDIpIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgIHRoaXMudHJpZ2dlck9uRW5kKGVudGl0eSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgQmVoYXZpb3IgZnJvbSAnLi4vQmVoYXZpb3InO1xuaW1wb3J0IHsgZGVnVG9SYWQsIFZlYzIgfSBmcm9tICcuLi9saWJzL21hdGgnXG5cbmV4cG9ydCBjb25zdCBMRUZUID0gLTE7XG5leHBvcnQgY29uc3QgUklHSFQgPSAxO1xuZXhwb3J0IGNvbnN0IFVQID0gLTE7XG5leHBvcnQgY29uc3QgRE9XTiA9IDE7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEp1bXAgZXh0ZW5kcyBCZWhhdmlvciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ2p1bXAnKTtcbiAgICB0aGlzLmlzRW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5zcGVlZCA9IDI1MDtcbiAgICB0aGlzLnJhdGlvID0gbmV3IFZlYzIoMywgMik7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5pc0p1bXBpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IG5ldyBWZWMyKExFRlQsIERPV04pO1xuICAgIHRoaXMubGFzdFBvcyA9IHRoaXMuZGlyZWN0aW9uLmNsb25lKCk7XG4gIH1cblxuICBlbmFibGUoKSB7XG4gICAgdGhpcy5pc0VuYWJsZWQgPSB0cnVlO1xuICB9XG47XG4gIGRpc2FibGUoKSB7XG4gICAgdGhpcy5pc0VuYWJsZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGxlZnREb3duKCkge1xuICAgIHRoaXMuX3N0YXJ0KExFRlQsIERPV04pO1xuICB9XG5cbiAgbGVmdFVwKCkge1xuICAgIHRoaXMuX3N0YXJ0KExFRlQsIFVQKTtcbiAgfVxuXG4gIHJpZ2h0RG93bigpIHtcbiAgICB0aGlzLl9zdGFydChSSUdIVCwgRE9XTik7XG4gIH1cblxuICByaWdodFVwKCkge1xuICAgIHRoaXMuX3N0YXJ0KFJJR0hULCBVUCk7XG4gIH1cblxuICBpc1RvTGVmdCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24ueCA9PT0gTEVGVDtcbiAgfVxuXG4gIGlzVG9SaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24ueCA9PT0gUklHSFQ7XG4gIH1cblxuICBpc1RvRG93bigpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24ueSA9PT0gRE9XTjtcbiAgfVxuXG4gIGlzVG9VcCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24ueSA9PT0gVVA7XG4gIH1cblxuICB1cGRhdGUoZW50aXR5LCBkZWx0YVRpbWUpIHtcbiAgICBpZighdGhpcy5pc0p1bXBpbmcpIHJldHVybjtcblxuICAgIHRoaXMuYW5nbGUgKz0gdGhpcy5zcGVlZCAqIGRlbHRhVGltZTtcblxuICAgIGxldCBmaW5pc2hlZCA9IHRoaXMuYW5nbGUgPiB0aGlzLm1heEFuZ2xlO1xuICAgIGlmKGZpbmlzaGVkKSB7XG4gICAgICB0aGlzLmFuZ2xlID0gdGhpcy5tYXhBbmdsZTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb3ZlRW50aXR5KGVudGl0eSk7XG5cbiAgICBpZihmaW5pc2hlZCkge1xuICAgICAgdGhpcy5fbm9ybWFsaXplRW50aXR5UG9zKGVudGl0eSk7XG4gICAgICB0aGlzLnRyaWdnZXJPbkVuZChlbnRpdHkpO1xuICAgICAgdGhpcy5pc0p1bXBpbmcgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBfbW92ZUVudGl0eShlbnRpdHkpIHtcbiAgICBsZXQgcmFkQW5nbGUgPSBkZWdUb1JhZCh0aGlzLnJlZkFuZ2xlIC0gdGhpcy5hbmdsZSk7XG4gICAgbGV0IHggPSBNYXRoLnNpbihyYWRBbmdsZSk7XG4gICAgbGV0IHkgPSBNYXRoLmNvcyhyYWRBbmdsZSk7XG5cbiAgICBlbnRpdHkucG9zLm1vdmUoXG4gICAgICBNYXRoLmFicyh4IC0gdGhpcy5sYXN0UG9zLngpICogdGhpcy5yYXRpby54ICogdGhpcy5kaXJlY3Rpb24ueCxcbiAgICAgIE1hdGguYWJzKHkgLSB0aGlzLmxhc3RQb3MueSkgKiB0aGlzLnJhdGlvLnkgKiB0aGlzLmRpcmVjdGlvbi55XG4gICAgKTtcbiAgICB0aGlzLmxhc3RQb3Muc2V0KHgsIHkpO1xuICB9XG5cbiAgX25vcm1hbGl6ZUVudGl0eVBvcyhlbnRpdHkpIHtcbiAgICBlbnRpdHkucG9zLnNldChcbiAgICAgIE1hdGgucm91bmQoZW50aXR5LnBvcy54KSxcbiAgICAgIE1hdGgucm91bmQoZW50aXR5LnBvcy55KVxuICAgICk7XG4gIH1cblxuICBfc3RhcnQoZGlyZWN0aW9uWCwgZGlyZWN0aW9uWSkge1xuICAgIGlmKHRoaXMuaXNKdW1waW5nIHx8ICF0aGlzLmlzRW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgdGhpcy5pc0p1bXBpbmcgPSB0cnVlO1xuICAgIHRoaXMuZGlyZWN0aW9uLnNldChkaXJlY3Rpb25YLCBkaXJlY3Rpb25ZKTtcbiAgICB0aGlzLmxhc3RQb3Muc2V0KFxuICAgICAgZGlyZWN0aW9uWSA+IDAgPyAwIDogMSxcbiAgICAgIGRpcmVjdGlvblkgPiAwID8gMSA6IDBcbiAgICApO1xuICAgIHRoaXMuYW5nbGUgPSAwO1xuICAgIHRoaXMubWF4QW5nbGUgPSA5MDtcbiAgICB0aGlzLnJlZkFuZ2xlID0gZGlyZWN0aW9uWSA+IDAgPyAwIDogOTA7XG5cbiAgICB0aGlzLnRyaWdnZXJPblN0YXJ0KHRoaXMuZGlyZWN0aW9uLmNsb25lKCkpO1xuICB9XG59XG4iLCJpbXBvcnQgQmVoYXZpb3IgZnJvbSAnLi4vQmVoYXZpb3InO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGF3biBleHRlbmRzIEJlaGF2aW9yIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcignc3Bhd24nKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5zcGVlZCA9IDU7XG4gIH1cblxuICBzdGFydChmaW5hbFBvcykge1xuICAgIGlmKHRoaXMuaXNBY3RpdmUoKSkgcmV0dXJuO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICB0aGlzLmlzU3Bhd25pbmcgPSB0cnVlO1xuICAgIHRoaXMucG9zaXRpb24gPSBmaW5hbFBvcy5jbG9uZSgpO1xuICAgIHRoaXMucG9zaXRpb24ueSA9IC0yO1xuICAgIHRoaXMuZmluYWxQb3MgPSBmaW5hbFBvcztcbiAgICB0aGlzLnRyaWdnZXJPblN0YXJ0KCk7XG4gIH1cblxuICBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc1NwYXduaW5nO1xuICB9XG5cbiAgdXBkYXRlKGVudGl0eSwgZGVsdGFUaW1lKSB7XG4gICAgdGhpcy5fY2hlY2tJZkZpbmlzaGVkKGVudGl0eSk7XG4gICAgaWYodGhpcy5pc1NwYXduaW5nKSB7XG4gICAgICB0aGlzLl9tb3ZlKGVudGl0eSwgZGVsdGFUaW1lKTtcbiAgICB9XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLmlzU3Bhd25pbmcgPSBmYWxzZTtcbiAgfVxuXG4gIF9tb3ZlKGVudGl0eSwgZGVsdGFUaW1lKSB7XG4gICAgdGhpcy5wb3NpdGlvbi5tb3ZlWSh0aGlzLnNwZWVkICogZGVsdGFUaW1lKTtcbiAgICBlbnRpdHkucG9zLnNldCh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG4gIH1cblxuICBfY2hlY2tJZkZpbmlzaGVkKGVudGl0eSkge1xuICAgIGlmKCF0aGlzLmlzU3Bhd25pbmcpIHJldHVybjtcbiAgICBpZihlbnRpdHkucG9zLnkgPj0gdGhpcy5maW5hbFBvcy55ICYmXG4gICAgICAgZW50aXR5LnBvcy55IDwgY29uZmlnLmdyaWQubGluZXMpIHtcbiAgICAgIGVudGl0eS5wb3Muc2V0KHRoaXMuZmluYWxQb3MueCwgdGhpcy5maW5hbFBvcy55KTtcbiAgICAgIHRoaXMuaXNTcGF3bmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy50cmlnZ2VyT25FbmQoKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBCZWhhdmlvciBmcm9tICcuLi9CZWhhdmlvcic7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdpbiBleHRlbmRzIEJlaGF2aW9yIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcignd2luJyk7XG4gICAgdGhpcy5zcGVlZCA9IDU7XG4gICAgdGhpcy5kaXN0YW5jZSA9IDE7XG4gICAgdGhpcy5vbkxvd2VzdFBvaW50TGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMub25IaWdoZXN0UG9pbnRMaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBzdGFydCh0aW1lcyA9IDEpIHtcbiAgICBpZih0aW1lcyA8PSAwKSByZXR1cm47XG4gICAgdGhpcy50aW1lcyA9IHRpbWVzO1xuICAgIHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IC0xO1xuICAgIHRoaXMudHJpZ2dlck9uU3RhcnQoKTtcbiAgfVxuXG4gIHRyaWdnZXJPbkhpZ2hlc3RQb2ludCgpIHtcbiAgICB0aGlzLm9uSGlnaGVzdFBvaW50TGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoKSk7XG4gIH1cblxuICB0cmlnZ2VyT25Mb3dlc3RQb2ludCgpIHtcbiAgICB0aGlzLm9uTG93ZXN0UG9pbnRMaXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcigpKTtcbiAgfVxuXG4gIHVwZGF0ZShlbnRpdHksIGRlbHRhVGltZSkge1xuICAgIGlmKCF0aGlzLmlzUnVubmluZykgcmV0dXJuO1xuXG4gICAgLy8gR2V0cyB0aGUgaW5pdGlhbCBlbnRpdHkgcG9zaXRpb25cbiAgICBpZighdGhpcy5pbml0aWFsUG9zaXRpb24pIHtcbiAgICAgIHRoaXMuaW5pdGlhbFBvc2l0aW9uID0gZW50aXR5LnBvcy55O1xuICAgICAgdGhpcy50YXJnZXRQb3NpdGlvbiA9IHRoaXMuaW5pdGlhbFBvc2l0aW9uIC0gdGhpcy5kaXN0YW5jZTtcbiAgICAgIGlmKGVudGl0eS5qdW1wKVxuICAgICAgICBlbnRpdHkuanVtcC5kaXNhYmxlKCk7XG4gICAgfVxuICAgIC8vIENhbGN1bGF0ZXMgdGhlIG1vdmVtZW50IHBvc2l0aW9uXG4gICAgbGV0IG5ld1Bvc2l0aW9uID0gZW50aXR5LnBvcy55ICsgdGhpcy5zcGVlZCAqIGRlbHRhVGltZSAqIHRoaXMuZGlyZWN0aW9uO1xuXG4gICAgaWYobmV3UG9zaXRpb24gPCB0aGlzLnRhcmdldFBvc2l0aW9uKSB7XG4gICAgICBuZXdQb3NpdGlvbiA9IHRoaXMudGFyZ2V0UG9zaXRpb247XG4gICAgICB0aGlzLmRpcmVjdGlvbiAqPSAtMTtcbiAgICAgIHRoaXMudHJpZ2dlck9uSGlnaGVzdFBvaW50KCk7XG4gICAgfSBlbHNlIGlmKG5ld1Bvc2l0aW9uID4gdGhpcy5pbml0aWFsUG9zaXRpb24pIHtcbiAgICAgIG5ld1Bvc2l0aW9uID0gdGhpcy5pbml0aWFsUG9zaXRpb247XG4gICAgICBpZigtLXRoaXMudGltZXMgPT09IDApIHtcbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50cmlnZ2VyT25FbmQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudHJpZ2dlck9uTG93ZXN0UG9pbnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZGlyZWN0aW9uICo9IC0xO1xuICAgIH1cblxuICAgIC8vIE1vdmUgdGhlIGVudGl0eVxuICAgIGVudGl0eS5wb3Muc2V0WShuZXdQb3NpdGlvbik7XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgc2NyZWVuOiB7XG4gICAgd2lkdGg6IDUxMixcbiAgICBoZWlnaHQ6IDM4NCxcbiAgfSxcbiAgZ3JpZDoge1xuICAgIGxpbmVzOiBwYXJzZUludCgzNjQgLyAxNiksXG4gICAgY29sdW1uczogcGFyc2VJbnQoNTEyIC8gMTYpLFxuICAgIHNpemU6IDE2LFxuICB9LFxuICBibG9jazoge1xuICAgIHN0YXJ0UG9zaXRpb246IHtcbiAgICAgIHg6IDMsXG4gICAgICB5OiAzXG4gICAgfSxcbiAgICBkaXN0YW5jZToge1xuICAgICAgbGluZTogMixcbiAgICAgIGNvbHVtbjogM1xuICAgIH1cbiAgfVxufTtcbiIsImltcG9ydCBFbnRpdHkgZnJvbSBcIi4uL0VudGl0eVwiO1xuaW1wb3J0IEp1bXAgZnJvbSAnLi4vYmVoYXZpb3JzL0p1bXAnO1xuaW1wb3J0IFNwYXduIGZyb20gJy4uL2JlaGF2aW9ycy9TcGF3bic7XG5pbXBvcnQgRGllIGZyb20gJy4uL2JlaGF2aW9ycy9EaWUnO1xuaW1wb3J0IHsgVmVjMiB9IGZyb20gXCIuLi9saWJzL21hdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGlsbCBleHRlbmRzIEVudGl0eSB7XG5cbiAgY29uc3RydWN0b3Ioc3ByaXRlTWFwLCBjb2xvcikge1xuICAgIHN1cGVyKG5ldyBWZWMyKDEzLCAtMikpO1xuXG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgIHRoaXMuYWNjdW11bGF0ZWRUaW1lID0gMDtcbiAgICB0aGlzLmp1bXBJbnRlcnZhbCA9IDE1MDA7XG5cbiAgICB0aGlzLl9pbml0aWFsaXplU3ByaXRlcyhzcHJpdGVNYXApO1xuICAgIHRoaXMuX3NldEN1cnJlbnRTcHJpdGUoJ2lkbGUnKTtcblxuICAgIHRoaXMuYWRkQmVoYXZpb3IobmV3IEp1bXAoKSk7XG4gICAgdGhpcy5hZGRCZWhhdmlvcihuZXcgU3Bhd24oKSk7XG4gICAgdGhpcy5hZGRCZWhhdmlvcihuZXcgRGllKCkpO1xuXG4gICAgdGhpcy5fYmluZEV2ZW50cygpO1xuICB9XG5cbiAgdXBkYXRlKGRlbHRhVGltZSkge1xuICAgIGlmKHRoaXMucmVhZHkpIHtcbiAgICAgIHRoaXMuYWNjdW11bGF0ZWRUaW1lICs9IGRlbHRhVGltZSAqIDEwMDA7XG4gICAgfVxuXG4gICAgaWYodGhpcy5hY2N1bXVsYXRlZFRpbWUgPj0gdGhpcy5qdW1wSW50ZXJ2YWwpIHtcbiAgICAgIHRoaXMuYWNjdW11bGF0ZWRUaW1lID0gMDtcbiAgICAgIHRoaXMucmFuZG9tSnVtcCgpO1xuICAgIH1cblxuICAgIHN1cGVyLnVwZGF0ZShkZWx0YVRpbWUpO1xuICB9XG5cbiAgcmFuZG9tSnVtcCgpIHtcbiAgICBpZihNYXRoLnJhbmRvbSgpIDwgMC41KVxuICAgICAgdGhpcy5qdW1wLnJpZ2h0RG93bigpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuanVtcC5sZWZ0RG93bigpO1xuICB9XG5cbiAgX2luaXRpYWxpemVTcHJpdGVzKHNwcml0ZU1hcCkge1xuICAgIHRoaXMuc3ByaXRlcyA9IHtcbiAgICAgICdpZGxlJzogc3ByaXRlTWFwLm5ld1Nwcml0ZShgcGlsbC0ke3RoaXMuY29sb3J9YCksXG4gICAgICAnaWRsZS1qdW1waW5nJzogc3ByaXRlTWFwLm5ld1Nwcml0ZShgcGlsbC0ke3RoaXMuY29sb3J9LWp1bXBpbmdgKSxcbiAgICAgICdkeWluZyc6IHNwcml0ZU1hcC5uZXdBbmltYXRpb24oYHBpbGwtJHt0aGlzLmNvbG9yfS1keWluZ2ApLFxuICAgIH07XG4gIH1cblxuICBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLnNwYXduLm9uRW5kTGlzdGVuZXJzLmFkZCgoKSA9PiB0aGlzLnJlYWR5ID0gdHJ1ZSk7XG5cbiAgICB0aGlzLmp1bXAub25TdGFydExpc3RlbmVycy5hZGQoKCkgPT4gdGhpcy5fc2V0Q3VycmVudFNwcml0ZSgnaWRsZS1qdW1waW5nJykpO1xuICAgIHRoaXMuanVtcC5vbkVuZExpc3RlbmVycy5hZGQoKCkgPT4gdGhpcy5fc2V0Q3VycmVudFNwcml0ZSgnaWRsZScpKTtcblxuICAgIHRoaXMuZGllLm9uU3RhcnRMaXN0ZW5lcnMuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuc3ByaXRlcy5keWluZy5wbGF5SW5Mb29wKCk7XG4gICAgICB0aGlzLl9zZXRDdXJyZW50U3ByaXRlKCdkeWluZycpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kaWUub25FbmRMaXN0ZW5lcnMuYWRkKCgpID0+IHtcbiAgICAgIHRoaXMuc3ByaXRlcy5keWluZy5zdG9wKCk7XG4gICAgICB0aGlzLl9zZXRDdXJyZW50U3ByaXRlKCdpZGxlJyk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBFbnRpdHkgZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCBKdW1wIGZyb20gJy4uL2JlaGF2aW9ycy9KdW1wJztcbmltcG9ydCBTcGF3biBmcm9tICcuLi9iZWhhdmlvcnMvU3Bhd24nO1xuaW1wb3J0IERpZSBmcm9tICcuLi9iZWhhdmlvcnMvRGllJztcbmltcG9ydCBXaW4gZnJvbSAnLi4vYmVoYXZpb3JzL1dpbic7XG5cbmNvbnN0IExFRlQgPSAwO1xuY29uc3QgUklHSFQgPSAxO1xuXG5jb25zdCBTVEFURV9JRExFID0gJ2lkbGUnO1xuY29uc3QgU1RBVEVfV09OID0gJ3dvbic7XG5jb25zdCBTVEFURV9KVU1QSU5HID0gJ2p1bXBpbmcnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRYmVydCBleHRlbmRzIEVudGl0eSB7XG5cbiAgY29uc3RydWN0b3Ioc3ByaXRlTWFwLCBwb3MpIHtcbiAgICBzdXBlcihwb3MpO1xuICAgIHRoaXMuX2luaXRpYWxpemVTcHJpdGVzKHNwcml0ZU1hcCk7XG5cbiAgICAvLyBJbml0aWFsIHN0YXRlXG4gICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0lETEU7XG5cbiAgICB0aGlzLmFkZEJlaGF2aW9yKG5ldyBKdW1wKCkpO1xuICAgIHRoaXMuYWRkQmVoYXZpb3IobmV3IFNwYXduKCkpO1xuICAgIHRoaXMuYWRkQmVoYXZpb3IobmV3IFdpbigpKTtcbiAgICB0aGlzLmFkZEJlaGF2aW9yKG5ldyBEaWUoKSk7XG5cbiAgICB0aGlzLl9iaW5kRGllTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5fYmluZFdpbkxpc3RlbmVycygpO1xuICB9XG5cbiAgdXBkYXRlKGRlbHRhVGltZSkge1xuICAgIHRoaXMuX3VwZGF0ZVNwcml0ZSgpO1xuICAgIHN1cGVyLnVwZGF0ZShkZWx0YVRpbWUpO1xuICB9XG5cbiAgX2JpbmREaWVMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5kaWUub25TdGFydExpc3RlbmVycy5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5zcHJpdGVzLmR5aW5nLnBsYXlJbkxvb3AoKTtcbiAgICAgIHRoaXMuX3NldEN1cnJlbnRTcHJpdGUoJ2R5aW5nJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpZS5vbkVuZExpc3RlbmVycy5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5zcHJpdGVzLmR5aW5nLnN0b3AoKTtcbiAgICAgIHRoaXMuanVtcC5yZXNldCgpO1xuICAgICAgdGhpcy5fc2V0Q3VycmVudFNwcml0ZSgnaWRsZS1mcm9udCcpO1xuICAgIH0pO1xuICB9XG5cbiAgX2JpbmRXaW5MaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy53aW4ub25TdGFydExpc3RlbmVycy5hZGQoKCkgPT4ge1xuICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1dPTjtcbiAgICAgIHRoaXMuX3NldEN1cnJlbnRTcHJpdGUoJ3dpbi1qdW1wJyk7XG4gICAgfSk7XG4gICAgdGhpcy53aW4ub25Mb3dlc3RQb2ludExpc3RlbmVycy5hZGQoKCkgPT4gdGhpcy5fc2V0Q3VycmVudFNwcml0ZSgnd2luLWp1bXAnKSk7XG4gICAgdGhpcy53aW4ub25IaWdoZXN0UG9pbnRMaXN0ZW5lcnMuYWRkKCgpID0+IHRoaXMuX3NldEN1cnJlbnRTcHJpdGUoJ3dpbicpKTtcbiAgICB0aGlzLndpbi5vbkVuZExpc3RlbmVycy5hZGQoKCkgPT4gdGhpcy5fc2V0Q3VycmVudFNwcml0ZSgnd2luJykpO1xuICB9XG5cbiAgX3VwZGF0ZVNwcml0ZSgpIHtcbiAgICBpZih0aGlzLmRpZS5pc0R5aW5nIHx8IHRoaXMuc3RhdGUgPT09IFNUQVRFX1dPTikgcmV0dXJuO1xuXG4gICAgLy8gVXBkYXRlcyB0aGUgZGlyZWN0aW9uXG4gICAgY29uc3QgeERpcmVjdGlvbiA9IHRoaXMuanVtcC5pc1RvTGVmdCgpID8gTEVGVCA6IFJJR0hUO1xuICAgIHRoaXMudHJhbnNmb3JtSW5kZXggPSB4RGlyZWN0aW9uO1xuXG4gICAgLy8gVXBkYXRlcyB0aGUgc3RhdGVcbiAgICB0aGlzLnN0YXRlID0gdGhpcy5qdW1wLmlzSnVtcGluZyA/IFNUQVRFX0pVTVBJTkcgOiBTVEFURV9JRExFO1xuICAgIGNvbnN0IHlEaXJlY3Rpb24gPSB0aGlzLmp1bXAuaXNUb0Rvd24oKSA/ICdmcm9udCcgOiAnYmFjayc7XG5cbiAgICB0aGlzLl9zZXRDdXJyZW50U3ByaXRlKGAke3RoaXMuc3RhdGV9LSR7eURpcmVjdGlvbn1gKTtcbiAgfVxuXG4gIF9pbml0aWFsaXplU3ByaXRlcyhzcHJpdGVNYXApIHtcbiAgICB0aGlzLnNwcml0ZXMgPSB7XG4gICAgICAnaWRsZS1mcm9udCc6IHNwcml0ZU1hcC5uZXdTcHJpdGUoJ3FiZXJ0LWZyb250JyksXG4gICAgICAnaWRsZS1iYWNrJzogc3ByaXRlTWFwLm5ld1Nwcml0ZSgncWJlcnQtYmFjaycpLFxuICAgICAgJ2p1bXBpbmctZnJvbnQnOiBzcHJpdGVNYXAubmV3U3ByaXRlKCdxYmVydC1mcm9udC1qdW1waW5nJyksXG4gICAgICAnanVtcGluZy1iYWNrJzogc3ByaXRlTWFwLm5ld1Nwcml0ZSgncWJlcnQtYmFjay1qdW1waW5nJyksXG4gICAgICAnZHlpbmcnOiBzcHJpdGVNYXAubmV3QW5pbWF0aW9uKCdxYmVydC1keWluZycpLFxuICAgICAgJ3dpbic6IHNwcml0ZU1hcC5uZXdTcHJpdGUoJ3FiZXJ0LXdpbmluZycpLFxuICAgICAgJ3dpbi1qdW1wJzogc3ByaXRlTWFwLm5ld1Nwcml0ZSgncWJlcnQtd2luaW5nLWp1bXAnKSxcbiAgICB9O1xuICB9XG59XG4iLCJpbXBvcnQgeyBsb2FkQmFja2dyb3VuZHMsIGxvYWRTcHJpdGVzLCBsb2FkTGV2ZWwgfSBmcm9tICcuL2xpYnMvbG9hZGVycyc7XG5cbmltcG9ydCBUaW1lciBmcm9tICcuL1RpbWVyJztcbmltcG9ydCBDb21wb3NpdG9yIGZyb20gJy4vQ29tcG9zaXRvcic7XG5pbXBvcnQgS2V5Ym9hcmQgZnJvbSAnLi9LZXlib2FyZCc7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oY2FudmFzKSB7XG4gIGNhbnZhcy5mb2N1cygpO1xuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgLy8gSW5wdXRcbiAgY29uc3QgaW5wdXQgPSBuZXcgS2V5Ym9hcmQoKTtcblxuICAvLyBNYXBzXG4gIGNvbnN0IHRpbGVzTWFwID0gYXdhaXQgbG9hZFNwcml0ZXMoJ3RpbGVzLmpzb24nKTtcbiAgY29uc3QgY2hhcmFjdGVyc01hcCA9IGF3YWl0IGxvYWRTcHJpdGVzKCdjaGFyYWN0ZXJzLmpzb24nKTtcbiAgY29uc3QgYmdNYXAgPSBhd2FpdCBsb2FkQmFja2dyb3VuZHMoJ2JhY2tncm91bmRzLmpzb24nLCB0aWxlc01hcCk7XG5cbiAgLy8gTGV2ZWxcbiAgY29uc3QgbGV2ZWwxID0gYXdhaXQgbG9hZExldmVsKDEsIHRpbGVzTWFwLCBjaGFyYWN0ZXJzTWFwLCBpbnB1dCk7XG5cbiAgLy8gQ29tcG9zaXRvclxuICBjb25zdCBjb21wb3NpdG9yID0gbmV3IENvbXBvc2l0b3IoKTtcblxuICBjb25zdCBiYWNrZ3JvdW5kID0gYmdNYXAuZ2V0TmV3QW5pbWF0aW9uKCdiZy1nYW1lJyk7XG4gIGNvbXBvc2l0b3IuYWRkTGF5ZXIoYmFja2dyb3VuZCk7XG5cbiAgY29uc3Qgc3RhZ2UxID0gbGV2ZWwxLmdldFN0YWdlKDEpO1xuICBjb21wb3NpdG9yLmFkZExheWVyKHN0YWdlMSk7XG5cbiAgc3RhZ2UxLm9uTGV2ZWxDbGVhcmVkTGlzdGVuZXJzLmFkZCgoKSA9PiB7XG4gICAgYmFja2dyb3VuZC5wbGF5SW5Mb29wKCk7XG4gIH0pO1xuXG4gIC8vIFN0YXJ0IGxpc3RlbmluZyB0aGUgaW5wdXRcbiAgaW5wdXQuc3RhcnRMaXN0ZW5pbmdUbyh3aW5kb3cpO1xuXG4gIC8vIFRpbWUgYmFzZWQgbWFpbiBsb29wXG4gIGNvbnN0IHRpbWVyID0gbmV3IFRpbWVyKCk7XG4gIHRpbWVyLnVwZGF0ZSA9IGRlbHRhVGltZSA9PiB7XG4gICAgY29tcG9zaXRvci51cGRhdGUoZGVsdGFUaW1lKTtcbiAgICBjb21wb3NpdG9yLnJlbmRlcihjb250ZXh0LCBkZWx0YVRpbWUpO1xuICB9O1xuICB0aW1lci5zdGFydCgpO1xufVxuXG5tYWluKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lJykpO1xuIiwiaW1wb3J0IHsgS2V5cyB9IGZyb20gJy4uL0tleWJvYXJkJztcblxuZXhwb3J0IGZ1bmN0aW9uIGp1bXBXaXRoS2V5cyhrZXlib2FyZCwgZW50aXR5KSB7XG4gIGtleWJvYXJkLmFkZEtleUxpc3RlbmVyKEtleXMuQXJyb3dMZWZ0LCAoc3RhdGUpID0+IHtcbiAgICBpZihzdGF0ZSAmJiBrZXlib2FyZC5nZXRLZXlTdGF0ZShLZXlzLkFycm93VXApKVxuICAgICAgZW50aXR5Lmp1bXAubGVmdFVwKCk7XG4gICAgZWxzZSBpZihzdGF0ZSAmJiBrZXlib2FyZC5nZXRLZXlTdGF0ZShLZXlzLkFycm93RG93bikpXG4gICAgICBlbnRpdHkuanVtcC5sZWZ0RG93bigpO1xuICB9KTtcblxuICBrZXlib2FyZC5hZGRLZXlMaXN0ZW5lcihLZXlzLkFycm93UmlnaHQsIChzdGF0ZSkgPT4ge1xuICAgIGlmKHN0YXRlICYmIGtleWJvYXJkLmdldEtleVN0YXRlKEtleXMuQXJyb3dVcCkpXG4gICAgICBlbnRpdHkuanVtcC5yaWdodFVwKCk7XG4gICAgZWxzZSBpZihzdGF0ZSAmJiBrZXlib2FyZC5nZXRLZXlTdGF0ZShLZXlzLkFycm93RG93bikpXG4gICAgICBlbnRpdHkuanVtcC5yaWdodERvd24oKTtcbiAgfSk7XG5cbiAga2V5Ym9hcmQuYWRkS2V5TGlzdGVuZXIoS2V5cy5BcnJvd1VwLCAoc3RhdGUpID0+IHtcbiAgICBpZihzdGF0ZSAmJiBrZXlib2FyZC5nZXRLZXlTdGF0ZShLZXlzLkFycm93TGVmdCkpXG4gICAgICBlbnRpdHkuanVtcC5sZWZ0VXAoKTtcbiAgICBlbHNlIGlmKHN0YXRlICYmIGtleWJvYXJkLmdldEtleVN0YXRlKEtleXMuQXJyb3dSaWdodCkpXG4gICAgICBlbnRpdHkuanVtcC5yaWdodFVwKCk7XG4gIH0pO1xuXG4gIGtleWJvYXJkLmFkZEtleUxpc3RlbmVyKEtleXMuQXJyb3dEb3duLCAoc3RhdGUpID0+IHtcbiAgICBpZihzdGF0ZSAmJiBrZXlib2FyZC5nZXRLZXlTdGF0ZShLZXlzLkFycm93TGVmdCkpXG4gICAgICBlbnRpdHkuanVtcC5sZWZ0RG93bigpO1xuICAgIGVsc2UgaWYoc3RhdGUgJiYga2V5Ym9hcmQuZ2V0S2V5U3RhdGUoS2V5cy5BcnJvd1JpZ2h0KSlcbiAgICAgIGVudGl0eS5qdW1wLnJpZ2h0RG93bigpO1xuICB9KTtcbn1cbiIsImltcG9ydCBCYWNrZ3JvdW5kTWFwIGZyb20gJy4uL0JhY2tncm91bmRNYXAnO1xuaW1wb3J0IFNwcml0ZU1hcCBmcm9tICcuLi9TcHJpdGVNYXAnO1xuaW1wb3J0IExldmVsIGZyb20gJy4uL0xldmVsJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRJbWFnZShpbWFnZUZpbGUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHJlc29sdmUoaW1hZ2UpKTtcbiAgICBpbWFnZS5zcmMgPSBgYXNzZXRzL2ltZ3MvJHtpbWFnZUZpbGV9YDtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU3ByaXRlcyhzcHJpdGVzU3BlY05hbWUpIHtcbiAgcmV0dXJuIGxvYWRKc29uKGBzcGVjcy8ke3Nwcml0ZXNTcGVjTmFtZX1gKVxuICAgIC50aGVuKHNwcml0ZXNTcGVjID0+IFByb21pc2UuYWxsKFtzcHJpdGVzU3BlYywgbG9hZEltYWdlKHNwcml0ZXNTcGVjLmltYWdlRmlsZSldKSlcbiAgICAudGhlbigoW3Nwcml0ZXNTcGVjLCBpbWFnZV0pID0+IG5ldyBTcHJpdGVNYXAoc3ByaXRlc1NwZWMsIGltYWdlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQmFja2dyb3VuZHMoYmdTcGVjTmFtZSwgdGlsZXNNYXApIHtcbiAgcmV0dXJuIGxvYWRKc29uKGBzcGVjcy8ke2JnU3BlY05hbWV9YClcbiAgICAudGhlbihiZ1NwZWMgPT4gbmV3IEJhY2tncm91bmRNYXAoYmdTcGVjLCB0aWxlc01hcCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZExldmVsKGxldmVsTnVtYmVyLCB0aWxlc01hcCwgY2hhcmFjdGVyc01hcCwgaW5wdXQpIHtcbiAgcmV0dXJuIGxvYWRKc29uKGBsZXZlbHMvbGV2ZWwtJHtsZXZlbE51bWJlcn0uanNvbmApXG4gICAgLnRoZW4obGV2ZWxTcGVjID0+IG5ldyBMZXZlbChsZXZlbFNwZWMsIHRpbGVzTWFwLCBjaGFyYWN0ZXJzTWFwLCBpbnB1dCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEpzb24oZmlsZU5hbWUpIHtcbiAgcmV0dXJuIGZldGNoKGBhc3NldHMvJHtmaWxlTmFtZX1gKS50aGVuKHJlc3AgPT4gcmVzcC5qc29uKCkpO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGRlZ1RvUmFkKGRlZykge1xuICByZXR1cm4gZGVnICogTWF0aC5QSSAvIDE4MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvRml4ZWQobnVtYmVyLCBkZWNpbWFscykge1xuICBsZXQgZmFjdG9yID0gTWF0aC5wb3coMTAsIGRlY2ltYWxzKTtcbiAgbGV0IHNpZ25hbCA9IG51bWJlciA+PSAwID8gMSA6IC0xO1xuICByZXR1cm4gTWF0aC5yb3VuZCgobnVtYmVyICogZmFjdG9yKSArIChzaWduYWwgKiAwLjAwMDEpKSAvIGZhY3Rvcjtcbn1cblxuZXhwb3J0IGNsYXNzIFZlYzIge1xuICBjb25zdHJ1Y3Rvcih4LCB5KSB7XG4gICAgaWYoQXJyYXkuaXNBcnJheSh4KSkge1xuICAgICAgeSA9IHhbMV07XG4gICAgICB4ID0geFswXTtcbiAgICB9XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG5cbiAgc3dhcCgpIHtcbiAgICB0aGlzLnkgPSBbdGhpcy54LCAodGhpcy54ID0gdGhpcy55KV1bMF07XG4gIH1cblxuICBjbG9uZSgpIHtcbiAgICByZXR1cm4gbmV3IFZlYzIodGhpcy54LCB0aGlzLnkpO1xuICB9XG5cbiAgc2V0KHgsIHkpIHtcbiAgICB0aGlzLnNldFgoeCk7XG4gICAgdGhpcy5zZXRZKHkpO1xuICB9XG5cbiAgc2V0WCh4KSB7XG4gICAgdGhpcy54ID0geDtcbiAgfVxuXG4gIHNldFkoeSkge1xuICAgIHRoaXMueSA9IHk7XG4gIH1cblxuICBtb3ZlKHgsIHkpIHtcbiAgICB0aGlzLm1vdmVYKHgpO1xuICAgIHRoaXMubW92ZVkoeSk7XG4gIH1cblxuICBtb3ZlWCh4KSB7XG4gICAgdGhpcy54ICs9IHg7XG4gIH1cblxuICBtb3ZlWSh5KSB7XG4gICAgdGhpcy55ICs9IHk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubWF0cml4ID0gW107XG4gIH1cblxuICBzZXQoeCwgeSwgdmFsdWUpIHtcbiAgICBsZXQgY29sID0gdGhpcy5tYXRyaXhbeF07XG4gICAgaWYoIWNvbCkge1xuICAgICAgY29sID0gW107XG4gICAgICB0aGlzLm1hdHJpeFt4XSA9IGNvbDtcbiAgICB9XG4gICAgY29sW3ldID0gdmFsdWU7XG4gIH1cblxuICBnZXQoeCwgeSkge1xuICAgIGxldCBjb2wgPSB0aGlzLm1hdHJpeFt4XTtcbiAgICByZXR1cm4gY29sID8gY29sW3ldIDogdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZyc7XG5cbi8vIFRoZSBibG9ja3MgZGlzdGFuY2VcbmNvbnN0IGRpc3RhbmNlID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmJsb2NrLmRpc3RhbmNlKTtcblxuLy8gVGhlIGRpcmVjdGlvbnMgc3RlcHNcbmNvbnN0IGRpcmVjdGlvbnMgPSBbXG4gIHsgbGluZTogMCwgY29sdW1uOiAyIH0sXG4gIHsgbGluZTogMiwgY29sdW1uOiAwIH0sXG4gIHsgbGluZTogMSwgY29sdW1uOiAxIH0sXG4gIHsgbGluZTogLTEsIGNvbHVtbjogMSB9LFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURpZUlmT3V0T2ZCb3VuZGFyaWVzQ2FsbEJhY2soYmxvY2tzRGF0YSkge1xuICByZXR1cm4gKGVudGl0eSkgPT4ge1xuICAgIGxldCBibG9jayA9IGJsb2Nrc0RhdGEuZ2V0KGVudGl0eS5wb3MueSwgZW50aXR5LnBvcy54KTtcbiAgICBpZighYmxvY2sgJiYgZW50aXR5LmRpZSlcbiAgICAgIGVudGl0eS5kaWUuc3RhcnQoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdGFnZUNsZWFyZWQoYmxvY2tzRGF0YSwgcmVmQmxvY2spIHtcbiAgbGV0IGNsZWFyZWQgPSBmYWxzZTtcbiAgZGlyZWN0aW9ucy5mb3JFYWNoKGRpcmVjdGlvbiA9PiB7XG4gICAgaWYoY2xlYXJlZCkgcmV0dXJuO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgYmxvY2tzIGluIHRoZSBnaXZlbiBkaXJlY3Rpb24gdG8gYmUgY2hlY2tlZFxuICAgIGRpcmVjdGlvbiA9IGludmVydERpcmVjdGlvbihkaXJlY3Rpb24pO1xuICAgIGxldCBibG9ja3MgPSBbXG4gICAgICBnZXROZXh0QmxvY2soYmxvY2tzRGF0YSwgcmVmQmxvY2ssIGRpcmVjdGlvbiksXG4gICAgICByZWZCbG9ja1xuICAgIF07XG4gICAgLy8gVmVyaWZpZXMgaWYgdGhlIGRpcmVjdGlvbiB3YXMgY2xlYXJlZFxuICAgIGNsZWFyZWQgPSBpc0RpcmVjdGlvbkNsZWFyZWQoYmxvY2tzRGF0YSwgYmxvY2tzLCBkaXJlY3Rpb24pO1xuICB9KTtcbiAgcmV0dXJuIGNsZWFyZWQ7XG59XG5cbmZ1bmN0aW9uIGlzRGlyZWN0aW9uQ2xlYXJlZChibG9ja3NEYXRhLCBibG9ja3MsIGRpcmVjdGlvbikge1xuICBsZXQgY2xlYXJlZENvdW50ID0gMDtcbiAgd2hpbGUoYmxvY2tzWzBdIHx8IGJsb2Nrc1sxXSkge1xuICAgIGJsb2NrcyA9IGJsb2Nrcy5tYXAoYmxvY2sgPT4ge1xuICAgICAgaWYoYmxvY2sgJiYgYmxvY2suY2xlYXJlZCkge1xuICAgICAgICBjbGVhcmVkQ291bnQrKztcbiAgICAgICAgYmxvY2sgPSBnZXROZXh0QmxvY2soYmxvY2tzRGF0YSwgYmxvY2ssIGRpcmVjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBibG9jayA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGRpcmVjdGlvbiA9IGludmVydERpcmVjdGlvbihkaXJlY3Rpb24pO1xuICAgICAgcmV0dXJuIGJsb2NrO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBjbGVhcmVkQ291bnQgPj0gNTtcbn1cblxuZnVuY3Rpb24gaW52ZXJ0RGlyZWN0aW9uKGRpcmVjdGlvbikge1xuICByZXR1cm4ge1xuICAgIGxpbmU6IGRpcmVjdGlvbi5saW5lICogLTEsXG4gICAgY29sdW1uOiBkaXJlY3Rpb24uY29sdW1uICogLTFcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TmV4dEJsb2NrKGJsb2Nrc0RhdGEsIGJsb2NrLCBkaXJlY3Rpb24pIHtcbiAgcmV0dXJuIGJsb2Nrc0RhdGEuZ2V0KFxuICAgIGJsb2NrLnBvcy55ICsgZGlzdGFuY2UubGluZSAgICogZGlyZWN0aW9uLmxpbmUsXG4gICAgYmxvY2sucG9zLnggKyBkaXN0YW5jZS5jb2x1bW4gKiBkaXJlY3Rpb24uY29sdW1uXG4gICk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gY2FzdEFycmF5KGRhdGEpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgZ2FtZSBmcm9tICcuL2FwcC9nYW1lJztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==