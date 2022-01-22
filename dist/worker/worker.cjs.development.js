'use strict';

var reactNil = require('react-nil');
var react = require('react');

var WorkerMessageType;

(function (WorkerMessageType) {
  WorkerMessageType[WorkerMessageType["INIT"] = 0] = "INIT";
  WorkerMessageType[WorkerMessageType["STEP"] = 1] = "STEP";
  WorkerMessageType[WorkerMessageType["LOGIC_FRAME"] = 2] = "LOGIC_FRAME";
  WorkerMessageType[WorkerMessageType["ADD_BODY"] = 3] = "ADD_BODY";
  WorkerMessageType[WorkerMessageType["REMOVE_BODY"] = 4] = "REMOVE_BODY";
  WorkerMessageType[WorkerMessageType["SET_BODY"] = 5] = "SET_BODY";
  WorkerMessageType[WorkerMessageType["UPDATE_BODY"] = 6] = "UPDATE_BODY";
  WorkerMessageType[WorkerMessageType["PHYSICS_STEP_PROCESSED"] = 7] = "PHYSICS_STEP_PROCESSED";
  WorkerMessageType[WorkerMessageType["READY_FOR_PHYSICS"] = 8] = "READY_FOR_PHYSICS";
})(WorkerMessageType || (WorkerMessageType = {}));

var WorkerOwnerMessageType;

(function (WorkerOwnerMessageType) {
  WorkerOwnerMessageType[WorkerOwnerMessageType["FRAME"] = 0] = "FRAME";
  WorkerOwnerMessageType[WorkerOwnerMessageType["PHYSICS_STEP"] = 1] = "PHYSICS_STEP";
  WorkerOwnerMessageType[WorkerOwnerMessageType["SYNC_BODIES"] = 2] = "SYNC_BODIES";
  WorkerOwnerMessageType[WorkerOwnerMessageType["BEGIN_COLLISION"] = 3] = "BEGIN_COLLISION";
  WorkerOwnerMessageType[WorkerOwnerMessageType["END_COLLISION"] = 4] = "END_COLLISION";
  WorkerOwnerMessageType[WorkerOwnerMessageType["MESSAGE"] = 5] = "MESSAGE";
  WorkerOwnerMessageType[WorkerOwnerMessageType["INITIATED"] = 6] = "INITIATED";
})(WorkerOwnerMessageType || (WorkerOwnerMessageType = {}));

/* eslint-disable no-restricted-globals */

self.$RefreshReg$ = function () {};

self.$RefreshSig$ = function () {
  return function () {};
};

var selfWorker = self;

selfWorker.onmessage = function (event) {
  var _event$data = event.data,
      type = _event$data.type,
      _event$data$props = _event$data.props,
      props = _event$data$props === void 0 ? {} : _event$data$props;

  switch (type) {
    case WorkerMessageType.INIT:
      var _props$worldParams = props.worldParams,
          worldParams = _props$worldParams === void 0 ? {} : _props$worldParams,
          _props$config = props.config,
          config = _props$config === void 0 ? {} : _props$config;
      var _config$maxNumberOfDy = config.maxNumberOfDynamicObjects,
          maxNumberOfDynamicObjects = _config$maxNumberOfDy === void 0 ? 100 : _config$maxNumberOfDy,
          _config$updateRate = config.updateRate,
          updateRate = _config$updateRate === void 0 ? 1000 / 30 : _config$updateRate;
      reactNil.render(react.createElement(require('./app/index').App, {
        worker: selfWorker,
        config: {
          maxNumberOfDynamicObjects: maxNumberOfDynamicObjects,
          updateRate: updateRate
        },
        worldParams: worldParams
      }, null));
      break;
  }
};
//# sourceMappingURL=worker.cjs.development.js.map
