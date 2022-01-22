'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var valtio = require('valtio');

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

var WorkerApp = function WorkerApp(_ref) {
  var app = _ref.app,
      worker = _ref.worker,
      state = _ref.state,
      workerRef = _ref.workerRef;
  var proxyState = valtio.useProxy(state);
  var initiated = proxyState.initiated;
  var physicsWorkerLoaded = proxyState.physicsWorkerLoaded;

  var _useState = React.useState(null),
      physicsWorker = _useState[0],
      setPhysicsWorker = _useState[1];

  React.useEffect(function () {
    if (physicsWorkerLoaded) {
      if (!workerRef.physicsWorker) {
        throw new Error("Worker missing.");
      }

      setPhysicsWorker(workerRef.physicsWorker);
    }
  }, [physicsWorkerLoaded]);
  var sendMessageToMain = React.useCallback(function (message) {
    var update = {
      type: WorkerOwnerMessageType.MESSAGE,
      message: message
    };
    worker.postMessage(update);
  }, [worker]);
  if (!initiated || !physicsWorker) return null;
  var App = app;
  return React__default.createElement(App, {
    worker: worker,
    physicsWorker: physicsWorker,
    sendMessageToMain: sendMessageToMain
  });
};

exports.WorkerApp = WorkerApp;
//# sourceMappingURL=workerapp.cjs.development.js.map
