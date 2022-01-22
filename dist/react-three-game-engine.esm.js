import 'planck-js/lib';
import 'planck-js';
import React, { useContext, createContext, useCallback, useState, useEffect, useRef, useMemo, useLayoutEffect, createElement } from 'react';
import { MathUtils, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import { render } from 'react-nil';
import { proxy } from 'valtio';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

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

var PHYSICS_UPDATE_RATE = 1000 / 30;

var BodyType;

(function (BodyType) {
  BodyType["static"] = "static";
  BodyType["kinematic"] = "kinematic";
  BodyType["dynamic"] = "dynamic";
})(BodyType || (BodyType = {}));

var BodyShape;

(function (BodyShape) {
  BodyShape["box"] = "box";
  BodyShape["circle"] = "circle";
})(BodyShape || (BodyShape = {}));

var createBoxFixture = function createBoxFixture(_ref) {
  var _ref$width = _ref.width,
      width = _ref$width === void 0 ? 1 : _ref$width,
      _ref$height = _ref.height,
      height = _ref$height === void 0 ? 1 : _ref$height,
      center = _ref.center,
      angle = _ref.angle,
      _ref$fixtureOptions = _ref.fixtureOptions,
      fixtureOptions = _ref$fixtureOptions === void 0 ? {} : _ref$fixtureOptions;
  var fixture = {
    shape: BodyShape.box,
    hx: width,
    hy: height,
    fixtureOptions: fixtureOptions
  };

  if (angle) {
    fixture.angle = angle;
  }

  if (center) {
    fixture.center = center;
  }

  return fixture;
};
var createCircleFixture = function createCircleFixture(_ref2) {
  var _ref2$radius = _ref2.radius,
      radius = _ref2$radius === void 0 ? 1 : _ref2$radius,
      position = _ref2.position,
      _ref2$fixtureOptions = _ref2.fixtureOptions,
      fixtureOptions = _ref2$fixtureOptions === void 0 ? {} : _ref2$fixtureOptions;
  return {
    shape: BodyShape.circle,
    radius: radius,
    position: position,
    fixtureOptions: fixtureOptions
  };
};

var Context = /*#__PURE__*/createContext(null);
var usePhysicsProvider = function usePhysicsProvider() {
  return useContext(Context);
};

var PhysicsProvider = function PhysicsProvider(_ref) {
  var children = _ref.children,
      worker = _ref.worker;
  var workerAddBody = useCallback(function (props) {
    worker.postMessage({
      type: WorkerMessageType.ADD_BODY,
      props: props
    });
  }, []);
  var workerRemoveBody = useCallback(function (props) {
    worker.postMessage({
      type: WorkerMessageType.REMOVE_BODY,
      props: props
    });
  }, []);
  var workerSetBody = useCallback(function (props) {
    worker.postMessage({
      type: WorkerMessageType.SET_BODY,
      props: props
    });
  }, []);
  var workerUpdateBody = useCallback(function (props) {
    worker.postMessage({
      type: WorkerMessageType.UPDATE_BODY,
      props: props
    });
  }, []);
  return React.createElement(Context.Provider, {
    value: {
      workerAddBody: workerAddBody,
      workerRemoveBody: workerRemoveBody,
      workerSetBody: workerSetBody,
      workerUpdateBody: workerUpdateBody
    }
  }, children);
};

var getPositionAndAngle = function getPositionAndAngle(buffers, index) {
  if (index !== undefined && buffers.positions.length) {
    var start = index * 2;
    var position = buffers.positions.slice(start, start + 2);
    return {
      position: position,
      angle: buffers.angles[index]
    };
  } else {
    return null;
  }
};

var Context$1 = /*#__PURE__*/createContext(null);
var useStoredData = function useStoredData() {
  return useContext(Context$1).data;
};

var StoredPhysicsData = function StoredPhysicsData(_ref) {
  var children = _ref.children;

  var _useState = useState({
    bodies: {}
  }),
      data = _useState[0];

  return React.createElement(Context$1.Provider, {
    value: {
      data: data
    }
  }, children);
};

var lerp = MathUtils.lerp;

var Context$2 = /*#__PURE__*/createContext(null);
var useLerpMeshes = function useLerpMeshes() {
  return useContext(Context$2).lerpMeshes;
};
var useSubscribeMesh = function useSubscribeMesh(uuid, objectRef, applyAngle, isDynamic) {
  if (applyAngle === void 0) {
    applyAngle = true;
  }

  if (isDynamic === void 0) {
    isDynamic = true;
  }

  var addSubscription = useContext(Context$2).addSubscription;
  useEffect(function () {
    if (!isDynamic) return;
    var unsubscribe = addSubscription(uuid, objectRef, applyAngle);
    return function () {
      unsubscribe();
    };
  }, [uuid, objectRef, applyAngle, isDynamic, addSubscription]);
};
var useUpdateMeshes = function useUpdateMeshes() {
  return useContext(Context$2).updateMeshes;
};

var MeshSubscriptions = function MeshSubscriptions(_ref) {
  var children = _ref.children;
  var subscriptionsRef = useRef({});
  var lerpMeshes = useCallback(function (getPhysicsStepTimeRemainingRatio) {
    Object.values(subscriptionsRef.current).forEach(function (_ref2) {
      var uuid = _ref2.uuid,
          objectRef = _ref2.objectRef,
          target = _ref2.target,
          applyAngle = _ref2.applyAngle,
          lastUpdate = _ref2.lastUpdate;
      if (!target) return;
      var object = objectRef.current;
      if (!object) return;
      var position = target.position,
          angle = target.angle;
      var physicsRemainingRatio = getPhysicsStepTimeRemainingRatio(lastUpdate != null ? lastUpdate : Date.now());
      object.position.x = lerp(object.position.x, position[0], physicsRemainingRatio);
      object.position.y = lerp(object.position.y, position[1], physicsRemainingRatio);

      if (applyAngle) {
        object.rotation.z = angle; // todo - lerp
      }

      subscriptionsRef.current[uuid].lastUpdate = Date.now();
    });
  }, [subscriptionsRef]);
  var storedData = useStoredData();
  var updateMeshes = useCallback(function (positions, angles, immediate) {
    Object.entries(subscriptionsRef.current).forEach(function (_ref3) {
      var uuid = _ref3[0],
          _ref3$ = _ref3[1],
          objectRef = _ref3$.objectRef,
          target = _ref3$.target,
          applyAngle = _ref3$.applyAngle;
      var object = objectRef.current;
      if (!object) return;
      var index = storedData.bodies[uuid];
      var update = getPositionAndAngle({
        positions: positions,
        angles: angles
      }, index);

      if (update) {
        if (immediate) {
          object.position.x = update.position[0];
          object.position.y = update.position[1];

          if (applyAngle) {
            object.rotation.x = update.angle;
          }
        } else if (target) {
          object.position.x = target.position[0];
          object.position.y = target.position[1];

          if (applyAngle) {
            object.rotation.x = target.angle;
          }
        }

        subscriptionsRef.current[uuid].target = {
          position: update.position,
          angle: update.angle
        };
      }
    });
  }, [subscriptionsRef, storedData]);
  var addSubscription = useCallback(function (uuid, objectRef, applyAngle) {
    subscriptionsRef.current[uuid] = {
      uuid: uuid,
      objectRef: objectRef,
      applyAngle: applyAngle
    };

    var unsubscribe = function unsubscribe() {
      delete subscriptionsRef.current[uuid];
    };

    return unsubscribe;
  }, [subscriptionsRef]);
  return React.createElement(Context$2.Provider, {
    value: {
      lerpMeshes: lerpMeshes,
      updateMeshes: updateMeshes,
      addSubscription: addSubscription
    }
  }, children);
};

var useBodyApi = function useBodyApi(passedUuid) {
  var _usePhysicsProvider = usePhysicsProvider(),
      workerSetBody = _usePhysicsProvider.workerSetBody,
      workerUpdateBody = _usePhysicsProvider.workerUpdateBody;

  var api = useMemo(function () {
    return {
      applyForceToCenter: function applyForceToCenter(vec, uuid) {
        workerSetBody({
          uuid: uuid != null ? uuid : passedUuid,
          method: 'applyForceToCenter',
          methodParams: [vec, true]
        });
      },
      applyLinearImpulse: function applyLinearImpulse(vec, pos, uuid) {
        workerSetBody({
          uuid: uuid != null ? uuid : passedUuid,
          method: 'applyLinearImpulse',
          methodParams: [vec, pos, true]
        });
      },
      setPosition: function setPosition(vec, uuid) {
        workerSetBody({
          uuid: uuid != null ? uuid : passedUuid,
          method: 'setPosition',
          methodParams: [vec]
        });
      },
      setAwake: function setAwake(flag, uuid) {
        workerSetBody({
          uuid: uuid != null ? uuid : passedUuid,
          method: 'setAwake',
          methodParams: [flag]
        });
      },
      setLinearVelocity: function setLinearVelocity(vec, uuid) {
        workerSetBody({
          uuid: uuid != null ? uuid : passedUuid,
          method: 'setLinearVelocity',
          methodParams: [vec]
        });
      },
      updateBody: function updateBody(data, uuid) {
        workerUpdateBody({
          uuid: uuid != null ? uuid : passedUuid,
          data: data
        });
      },
      setAngle: function setAngle(angle, uuid) {
        workerSetBody({
          uuid: uuid != null ? uuid : passedUuid,
          method: 'setAngle',
          methodParams: [angle]
        });
      }
    };
  }, [passedUuid]);
  return api;
};
var useBody = function useBody(propsFn, bodyParams) {
  if (bodyParams === void 0) {
    bodyParams = {};
  }

  var _bodyParams = bodyParams,
      _bodyParams$applyAngl = _bodyParams.applyAngle,
      applyAngle = _bodyParams$applyAngl === void 0 ? false : _bodyParams$applyAngl,
      cacheKey = _bodyParams.cacheKey,
      passedUUID = _bodyParams.uuid,
      fwdRef = _bodyParams.fwdRef,
      _bodyParams$listenFor = _bodyParams.listenForCollisions,
      listenForCollisions = _bodyParams$listenFor === void 0 ? false : _bodyParams$listenFor,
      _bodyParams$syncBody = _bodyParams.syncBody,
      syncBody = _bodyParams$syncBody === void 0 ? true : _bodyParams$syncBody;
  var localRef = useRef(null);
  var ref = fwdRef ? fwdRef : localRef;

  var _useState = useState(function () {
    if (passedUUID) return passedUUID;

    if (!ref.current) {
      ref.current = new Object3D();
    }

    return ref.current.uuid;
  }),
      uuid = _useState[0];

  var _useState2 = useState(function () {
    var props = propsFn();
    return props.type !== BodyType["static"];
  }),
      isDynamic = _useState2[0];

  var _usePhysicsProvider2 = usePhysicsProvider(),
      workerAddBody = _usePhysicsProvider2.workerAddBody,
      workerRemoveBody = _usePhysicsProvider2.workerRemoveBody;

  useLayoutEffect(function () {
    var props = propsFn();

    if (!ref.current) {
      ref.current = new Object3D();
    }

    var object = ref.current;

    if (object) {
      var _props$position, _props$position2;

      object.position.x = ((_props$position = props.position) == null ? void 0 : _props$position.x) || 0;
      object.position.y = ((_props$position2 = props.position) == null ? void 0 : _props$position2.y) || 0;
    }

    workerAddBody(_extends({
      uuid: uuid,
      listenForCollisions: listenForCollisions,
      cacheKey: cacheKey
    }, props));
    return function () {
      workerRemoveBody({
        uuid: uuid,
        cacheKey: cacheKey
      });
    };
  }, []);
  useSubscribeMesh(uuid, ref, applyAngle, syncBody && isDynamic);
  var api = useBodyApi(uuid);
  return [ref, api, uuid];
};

var Context$3 = /*#__PURE__*/createContext(null);
var useWorkerOnMessage = function useWorkerOnMessage() {
  return useContext(Context$3).subscribe;
};

var WorkerOnMessageProvider = function WorkerOnMessageProvider(_ref) {
  var children = _ref.children,
      subscribe = _ref.subscribe;
  return React.createElement(Context$3.Provider, {
    value: {
      subscribe: subscribe
    }
  }, children);
};

var Context$4 = /*#__PURE__*/createContext(null);
var useGetPhysicsStepTimeRemainingRatio = function useGetPhysicsStepTimeRemainingRatio() {
  return useContext(Context$4).getPhysicsStepTimeRemainingRatio;
};
var useFixedUpdate = function useFixedUpdate(callback) {
  var onFixedUpdate = useContext(Context$4).onFixedUpdate;
  useEffect(function () {
    var unsubscribe = onFixedUpdate(callback);
    return function () {
      unsubscribe();
    };
  }, [onFixedUpdate, callback]);
};

var PhysicsSync = function PhysicsSync(_ref) {
  var children = _ref.children,
      worker = _ref.worker,
      _ref$noLerping = _ref.noLerping,
      noLerping = _ref$noLerping === void 0 ? false : _ref$noLerping;
  var lastUpdateRef = useRef(Date.now());
  var countRef = useRef(0);
  var callbacksRef = useRef({});
  var updateMeshes = useUpdateMeshes();
  var getPhysicsStepTimeRemainingRatio = useCallback(function (previousTime) {
    var nextExpectedUpdate = lastUpdateRef.current + PHYSICS_UPDATE_RATE + 1;
    var time = Date.now();
    var ratio = (time - previousTime) / (nextExpectedUpdate - previousTime);
    ratio = ratio > 1 ? 1 : ratio;
    ratio = ratio < 0 ? 0 : ratio;
    return ratio;
  }, [lastUpdateRef]);
  var onFixedUpdate = useCallback(function (callback) {
    var key = countRef.current;
    countRef.current += 1;
    callbacksRef.current[key] = callback;

    var unsubscribe = function unsubscribe() {
      delete callbacksRef.current[key];
    };

    return unsubscribe;
  }, [callbacksRef]);
  var onMessage = useWorkerOnMessage();
  var storedData = useStoredData();
  var debugRefs = useRef({
    timer: null,
    hasReceived: false
  });
  useEffect(function () {
    debugRefs.current.timer = setTimeout(function () {
      console.warn('no initial physics data received...');
    }, 1000);

    var onPhysicsStep = function onPhysicsStep() {
      var lastUpdate = lastUpdateRef.current;
      var now = Date.now();
      var delta = !lastUpdate ? 1 / 60 : (now - lastUpdate) / 1000;
      lastUpdateRef.current = now;
      var callbacks = callbacksRef.current;
      Object.values(callbacks).forEach(function (callback) {
        callback(delta);
      });
    };

    var unsubscribe = onMessage(function (event) {
      var type = event.data.type;

      if (type === WorkerOwnerMessageType.PHYSICS_STEP) {
        debugRefs.current.hasReceived = true;

        if (debugRefs.current.timer) {
          clearInterval(debugRefs.current.timer);
        }

        debugRefs.current.timer = setTimeout(function () {
          console.warn('over 1 second since last physics step...');
        }, 1000);
        var positions = event.data.positions;
        var angles = event.data.angles;
        updateMeshes(positions, angles, noLerping);
        worker.postMessage({
          type: WorkerMessageType.PHYSICS_STEP_PROCESSED,
          positions: positions,
          angles: angles,
          physicsTick: event.data.physicsTick
        }, [positions.buffer, angles.buffer]);

        if (event.data.bodies) {
          storedData.bodies = event.data.bodies.reduce(function (acc, id) {
            var _extends2;

            return _extends({}, acc, (_extends2 = {}, _extends2[id] = event.data.bodies.indexOf(id), _extends2));
          }, {});
        }

        onPhysicsStep();
      }
    });
    worker.postMessage({
      type: WorkerMessageType.READY_FOR_PHYSICS
    });
    return function () {
      unsubscribe();
    };
  }, [onMessage, callbacksRef, lastUpdateRef, worker, updateMeshes, noLerping, storedData]);
  return React.createElement(Context$4.Provider, {
    value: {
      onFixedUpdate: onFixedUpdate,
      getPhysicsStepTimeRemainingRatio: getPhysicsStepTimeRemainingRatio
    }
  }, children);
};

var useWorkerMessages = function useWorkerMessages(worker) {
  var idCount = useRef(0);
  var subscriptionsRef = useRef({});
  var subscribe = useCallback(function (callback) {
    var id = idCount.current;
    idCount.current += 1;
    subscriptionsRef.current[id] = callback;
    return function () {
      delete subscriptionsRef.current[id];
    };
  }, [subscriptionsRef]);
  useEffect(function () {
    if (!worker) return;
    var previousOnMessage = worker.onmessage;

    worker.onmessage = function (event) {
      Object.values(subscriptionsRef.current).forEach(function (callback) {
        callback(event);
      });

      if (previousOnMessage) {
        previousOnMessage(event);
      }
    };
  }, [worker, subscriptionsRef]);
  return subscribe;
};

var Context$5 = /*#__PURE__*/createContext(null);
var usePhysicsWorker = function usePhysicsWorker() {
  return useContext(Context$5).worker;
};

var PhysicsWorker = function PhysicsWorker(_ref) {
  var children = _ref.children,
      physicsWorker = _ref.physicsWorker,
      config = _ref.config,
      worldParams = _ref.worldParams;
  var worker = physicsWorker;

  var _useState = useState(false),
      initiated = _useState[0],
      setInitiated = _useState[1];

  useEffect(function () {
    worker.postMessage({
      type: WorkerMessageType.INIT,
      props: {
        config: config,
        worldParams: worldParams
      }
    });
  }, [worker]);
  var subscribe = useWorkerMessages(worker);
  useEffect(function () {
    var unsubscribe = subscribe(function (event) {
      var type = event.data.type;

      if (type === WorkerOwnerMessageType.INITIATED) {
        setInitiated(true);
      }

      return function () {
        unsubscribe();
      };
    });
  }, [subscribe, setInitiated]);
  if (!initiated) return null;
  return React.createElement(Context$5.Provider, {
    value: {
      worker: worker
    }
  }, React.createElement(PhysicsProvider, {
    worker: worker
  }, React.createElement(StoredPhysicsData, null, React.createElement(MeshSubscriptions, null, React.createElement(WorkerOnMessageProvider, {
    subscribe: subscribe
  }, React.createElement(PhysicsSync, {
    worker: worker
  }, children))))));
};

var R3FPhysicsObjectUpdater = function R3FPhysicsObjectUpdater(_ref) {
  var children = _ref.children;
  var getPhysicsStepTimeRemainingRatio = useGetPhysicsStepTimeRemainingRatio();
  var lerpMeshes = useLerpMeshes();
  var onFrame = useCallback(function () {
    lerpMeshes(getPhysicsStepTimeRemainingRatio);
  }, [getPhysicsStepTimeRemainingRatio, lerpMeshes]);
  useFrame(onFrame);
  return React.createElement(React.Fragment, null, children);
};

var CollisionsProviderContext = /*#__PURE__*/createContext(null);
var useCollisionsProviderContext = function useCollisionsProviderContext() {
  return useContext(CollisionsProviderContext);
};

var CollisionsProvider = function CollisionsProvider(_ref) {
  var children = _ref.children;

  var _useState = useState({}),
      collisionStartedEvents = _useState[0];

  var _useState2 = useState({}),
      collisionEndedEvents = _useState2[0];

  var addCollisionHandler = useCallback(function (started, uuid, callback) {
    if (started) {
      collisionStartedEvents[uuid] = callback;
    } else {
      collisionEndedEvents[uuid] = callback;
    }
  }, []);
  var removeCollisionHandler = useCallback(function (started, uuid) {
    if (started) {
      delete collisionStartedEvents[uuid];
    } else {
      delete collisionEndedEvents[uuid];
    }
  }, []);
  var handleBeginCollision = useCallback(function (data) {
    if (collisionStartedEvents[data.uuid]) {
      collisionStartedEvents[data.uuid](data.data, data.fixtureIndex, data.collidedFixtureIndex, data.isSensor);
    }
  }, [collisionStartedEvents]);
  var handleEndCollision = useCallback(function (data) {
    if (collisionEndedEvents[data.uuid]) {
      collisionEndedEvents[data.uuid](data.data, data.fixtureIndex, data.collidedFixtureIndex, data.isSensor);
    }
  }, [collisionEndedEvents]);
  var onMessage = useWorkerOnMessage();
  useEffect(function () {
    var unsubscribe = onMessage(function (event) {
      var type = event.data.type;

      switch (type) {
        case WorkerOwnerMessageType.BEGIN_COLLISION:
          handleBeginCollision(event.data.props);
          break;

        case WorkerOwnerMessageType.END_COLLISION:
          handleEndCollision(event.data.props);
          break;
      }
    });
    return unsubscribe;
  }, []);
  return React.createElement(CollisionsProviderContext.Provider, {
    value: {
      addCollisionHandler: addCollisionHandler,
      removeCollisionHandler: removeCollisionHandler,
      handleBeginCollision: handleBeginCollision,
      handleEndCollision: handleEndCollision
    }
  }, children);
};

var MeshRefsContext = /*#__PURE__*/createContext(null);
var useStoreMesh = function useStoreMesh(uuid, mesh) {
  var addMesh = useContext(MeshRefsContext).addMesh;
  useEffect(function () {
    var remove = addMesh(uuid, mesh);
    return function () {
      remove();
    };
  }, [addMesh, uuid, mesh]);
};
var useStoredMesh = function useStoredMesh(uuid) {
  var meshes = useContext(MeshRefsContext).meshes;
  var mesh = useMemo(function () {
    var _meshes$uuid;

    return (_meshes$uuid = meshes[uuid]) != null ? _meshes$uuid : null;
  }, [uuid, meshes]);
  return mesh;
};

var MeshRefs = function MeshRefs(_ref) {
  var children = _ref.children;

  var _useState = useState({}),
      meshes = _useState[0],
      setMeshes = _useState[1];

  var addMesh = useCallback(function (uuid, mesh) {
    setMeshes(function (state) {
      var _extends2;

      return _extends({}, state, (_extends2 = {}, _extends2[uuid] = mesh, _extends2));
    });

    var removeMesh = function removeMesh() {
      setMeshes(function (state) {
        var updated = _extends({}, state);

        delete updated[uuid];
        return updated;
      });
    };

    return removeMesh;
  }, [setMeshes]);
  return React.createElement(MeshRefsContext.Provider, {
    value: {
      meshes: meshes,
      addMesh: addMesh
    }
  }, children);
};

var MessagesContext = /*#__PURE__*/createContext(null);
var useMessagesContext = function useMessagesContext() {
  return useContext(MessagesContext);
};
var useOnMessage = function useOnMessage() {
  return useMessagesContext().subscribeToMessage;
};

var Messages = function Messages(_ref) {
  var children = _ref.children;
  var messageCountRef = useRef(0);

  var _useState = useState({}),
      messageSubscriptions = _useState[0];

  var subscribeToMessage = useCallback(function (messageKey, callback) {
    var id = messageCountRef.current;
    messageCountRef.current += 1;

    if (!messageSubscriptions[messageKey]) {
      var _messageSubscriptions;

      messageSubscriptions[messageKey] = (_messageSubscriptions = {}, _messageSubscriptions[id] = callback, _messageSubscriptions);
    } else {
      messageSubscriptions[messageKey][id] = callback;
    }

    var unsubscribe = function unsubscribe() {
      delete messageSubscriptions[messageKey][id];
    };

    return unsubscribe;
  }, [messageSubscriptions]);
  var handleMessage = useCallback(function (_ref2) {
    var key = _ref2.key,
        data = _ref2.data;
    var subscriptions = messageSubscriptions[key];

    if (subscriptions) {
      Object.values(subscriptions).forEach(function (subscription) {
        subscription(data);
      });
    }
  }, [messageSubscriptions]);
  return React.createElement(MessagesContext.Provider, {
    value: {
      handleMessage: handleMessage,
      subscribeToMessage: subscribeToMessage
    }
  }, children);
};

var MessageKeys;

(function (MessageKeys) {
  MessageKeys["SYNC_COMPONENT"] = "SYNC_COMPONENT";
})(MessageKeys || (MessageKeys = {}));

var SyncComponentMessageType;

(function (SyncComponentMessageType) {
  SyncComponentMessageType[SyncComponentMessageType["MOUNT"] = 0] = "MOUNT";
  SyncComponentMessageType[SyncComponentMessageType["UNMOUNT"] = 1] = "UNMOUNT";
  SyncComponentMessageType[SyncComponentMessageType["UPDATE"] = 2] = "UPDATE";
})(SyncComponentMessageType || (SyncComponentMessageType = {}));

var SyncComponentType;

(function (SyncComponentType) {
  SyncComponentType[SyncComponentType["PLAYER"] = 0] = "PLAYER";
})(SyncComponentType || (SyncComponentType = {}));

var LogicHandler = function LogicHandler(_ref) {
  var children = _ref.children,
      mappedComponentTypes = _ref.mappedComponentTypes;
  var subscribeToMessage = useOnMessage();

  var _useState = useState({}),
      components = _useState[0],
      setComponents = _useState[1];

  useEffect(function () {
    var unsubscribe = subscribeToMessage(MessageKeys.SYNC_COMPONENT, function (_ref2) {
      var info = _ref2.info,
          messageType = _ref2.messageType,
          data = _ref2.data;
      var props = data || {};

      switch (messageType) {
        case SyncComponentMessageType.MOUNT:
          setComponents(function (state) {
            var _extends2;

            return _extends({}, state, (_extends2 = {}, _extends2[info.componentKey] = {
              componentType: info.componentType,
              props: props
            }, _extends2));
          });
          break;

        case SyncComponentMessageType.UPDATE:
          setComponents(function (state) {
            var _extends3;

            var previousData = state[info.componentKey];
            var previousProps = previousData && previousData.props ? previousData.props : {};
            return _extends({}, state, (_extends3 = {}, _extends3[info.componentKey] = {
              componentType: info.componentType,
              props: _extends({}, previousProps, props)
            }, _extends3));
          });
          break;

        case SyncComponentMessageType.UNMOUNT:
          setComponents(function (state) {
            var update = _extends({}, state);

            delete update[info.componentKey];
            return update;
          });
          break;
      }
    });
    return function () {
      unsubscribe();
    };
  }, []);
  return React.createElement(React.Fragment, null, children, Object.entries(components).map(function (_ref3) {
    var key = _ref3[0],
        _ref3$ = _ref3[1],
        componentType = _ref3$.componentType,
        props = _ref3$.props;
    var Component = mappedComponentTypes[componentType];
    return Component ? React.createElement(Component, Object.assign({
      key: key
    }, props)) : null;
  }));
};

var Context$6 = /*#__PURE__*/createContext(null);
var useSendMessage = function useSendMessage() {
  return useContext(Context$6).sendMessage;
};

var SendMessages = function SendMessages(_ref) {
  var children = _ref.children,
      worker = _ref.worker;

  var _useMessagesContext = useMessagesContext(),
      handleMessage = _useMessagesContext.handleMessage;

  var sendMessage = useCallback(function (key, data) {
    if (key === MessageKeys.SYNC_COMPONENT) {
      throw new Error(key + " is a reserved message key.");
    }

    var message = {
      key: key,
      data: data
    };
    worker.postMessage({
      type: WorkerOwnerMessageType.MESSAGE,
      message: message
    });
    handleMessage(message);
  }, [worker, handleMessage]);
  return React.createElement(Context$6.Provider, {
    value: {
      sendMessage: sendMessage
    }
  }, children);
};

var LogicWorkerInner = function LogicWorkerInner(_ref) {
  var children = _ref.children,
      worker = _ref.worker;
  var physicsWorker = usePhysicsWorker();

  var _useMessagesContext = useMessagesContext(),
      handleMessage = _useMessagesContext.handleMessage;

  useEffect(function () {
    var channel = new MessageChannel();
    physicsWorker.postMessage({
      command: 'connect'
    }, [channel.port1]);
    worker.postMessage({
      command: 'connect'
    }, [channel.port2]);

    worker.onmessage = function (event) {
      var type = event.data.type;

      switch (type) {
        case WorkerOwnerMessageType.MESSAGE:
          handleMessage(event.data.message);
          break;
      }
    };

    worker.postMessage({
      type: WorkerMessageType.INIT
    });
  }, [worker, physicsWorker]);
  return React.createElement(React.Fragment, null, children);
};

var LogicWorker = function LogicWorker(_ref2) {
  var worker = _ref2.worker,
      children = _ref2.children,
      logicMappedComponents = _ref2.logicMappedComponents;
  return React.createElement(Messages, null, React.createElement(SendMessages, {
    worker: worker
  }, React.createElement(LogicWorkerInner, {
    worker: worker
  }, React.createElement(LogicHandler, {
    mappedComponentTypes: logicMappedComponents
  }, children))));
};

var Engine = function Engine(_ref) {
  var children = _ref.children,
      physicsWorker = _ref.physicsWorker,
      config = _ref.config,
      worldParams = _ref.worldParams,
      logicWorker = _ref.logicWorker,
      _ref$logicMappedCompo = _ref.logicMappedComponents,
      logicMappedComponents = _ref$logicMappedCompo === void 0 ? {} : _ref$logicMappedCompo;

  if (logicWorker) {
    return React.createElement(MeshRefs, null, React.createElement(PhysicsWorker, {
      physicsWorker: physicsWorker,
      config: config,
      worldParams: worldParams
    }, React.createElement(CollisionsProvider, null, React.createElement(R3FPhysicsObjectUpdater, null, React.createElement(LogicWorker, {
      worker: logicWorker,
      logicMappedComponents: logicMappedComponents
    }, children)))));
  }

  return React.createElement(MeshRefs, null, React.createElement(PhysicsWorker, {
    physicsWorker: physicsWorker,
    config: config,
    worldParams: worldParams
  }, React.createElement(CollisionsProvider, null, React.createElement(R3FPhysicsObjectUpdater, null, children))));
};

var logicWorkerHandler = function logicWorkerHandler(selfWorker, app) {
  var physicsWorkerPort;
  var state = proxy({
    physicsWorkerLoaded: false,
    initiated: false
  });
  var workerRef = {
    physicsWorker: null
  };

  selfWorker.onmessage = function (event) {
    switch (event.data.command) {
      case 'connect':
        physicsWorkerPort = event.ports[0];
        workerRef.physicsWorker = physicsWorkerPort;
        state.physicsWorkerLoaded = true;
        return;

      case 'forward':
        physicsWorkerPort.postMessage(event.data.message);
        return;
    }

    var _event$data = event.data,
        type = _event$data.type;

    switch (type) {
      case WorkerMessageType.INIT:
        state.initiated = true;
        break;
    }
  };

  render(createElement(require('./logicWorkerApp/index').WorkerApp, {
    worker: selfWorker,
    state: state,
    workerRef: workerRef,
    app: app
  }, null));
};

var PhysicsHandler = function PhysicsHandler(_ref) {
  var children = _ref.children,
      worker = _ref.worker;
  if (!worker) return null;
  var subscribe = useWorkerMessages(worker);
  return React.createElement(PhysicsProvider, {
    worker: worker
  }, React.createElement(WorkerOnMessageProvider, {
    subscribe: subscribe
  }, React.createElement(StoredPhysicsData, null, React.createElement(MeshSubscriptions, null, React.createElement(PhysicsSync, {
    worker: worker,
    noLerping: true
  }, children)))));
};

var MessageHandler = function MessageHandler(_ref) {
  var children = _ref.children,
      worker = _ref.worker;

  var _useMessagesContext = useMessagesContext(),
      handleMessage = _useMessagesContext.handleMessage;

  useEffect(function () {
    worker.onmessage = function (event) {
      var type = event.data.type;

      switch (type) {
        case WorkerOwnerMessageType.MESSAGE:
          handleMessage(event.data.message);
          break;
      }
    };
  }, [worker]);
  return React.createElement(React.Fragment, null, children);
};

var Context$7 = /*#__PURE__*/createContext(null);
var useWorkerAppContext = function useWorkerAppContext() {
  return useContext(Context$7);
};
var useSendMessageToMain = function useSendMessageToMain() {
  return useWorkerAppContext().sendMessageToMain;
};

var ApiWrapper = function ApiWrapper(_ref) {
  var children = _ref.children,
      worker = _ref.worker,
      physicsWorker = _ref.physicsWorker,
      sendMessageToMain = _ref.sendMessageToMain;
  return React.createElement(Context$7.Provider, {
    value: {
      physicsWorker: physicsWorker,
      sendMessageToMain: sendMessageToMain
    }
  }, React.createElement(Messages, null, React.createElement(MessageHandler, {
    worker: worker
  }, React.createElement(SendMessages, {
    worker: worker
  }, React.createElement(MeshRefs, null, React.createElement(PhysicsHandler, {
    worker: physicsWorker
  }, React.createElement(CollisionsProvider, null, children)))))));
};
var withLogicWrapper = function withLogicWrapper(WrappedComponent) {
  return function (props) {
    return React.createElement(ApiWrapper, Object.assign({}, props), React.createElement(WrappedComponent, null));
  };
};

var useSendSyncComponentMessage = function useSendSyncComponentMessage() {
  var sendMessageRaw = useSendMessageToMain();
  var sendMessage = useCallback(function (messageType, info, data) {
    sendMessageRaw({
      key: MessageKeys.SYNC_COMPONENT,
      data: {
        messageType: messageType,
        info: info,
        data: data
      }
    });
  }, [sendMessageRaw]);
  return sendMessage;
};

var useSyncWithMainComponent = function useSyncWithMainComponent(componentType, componentKey, initialProps) {
  var sendMessage = useSendSyncComponentMessage();
  var info = useMemo(function () {
    return {
      componentType: componentType,
      componentKey: componentKey
    };
  }, [componentType, componentKey]);
  var updateProps = useCallback(function (props) {
    sendMessage(SyncComponentMessageType.UPDATE, info, props);
  }, [info]);
  useEffect(function () {
    sendMessage(SyncComponentMessageType.MOUNT, info, initialProps);
    return function () {
      sendMessage(SyncComponentMessageType.UNMOUNT, info);
    };
  }, [info]);
  return updateProps;
};

var BodySync = function BodySync(_ref) {
  var children = _ref.children,
      uuid = _ref.uuid,
      bodyRef = _ref.bodyRef,
      _ref$applyAngle = _ref.applyAngle,
      applyAngle = _ref$applyAngle === void 0 ? true : _ref$applyAngle,
      _ref$isDynamic = _ref.isDynamic,
      isDynamic = _ref$isDynamic === void 0 ? true : _ref$isDynamic,
      _ref$wrapWithGroup = _ref.wrapWithGroup,
      wrapWithGroup = _ref$wrapWithGroup === void 0 ? false : _ref$wrapWithGroup;
  var localRef = useRef(new Object3D());
  var ref = bodyRef != null ? bodyRef : localRef;
  useSubscribeMesh(uuid, ref, applyAngle, isDynamic);
  var api = useBodyApi(uuid);
  var inner = children({
    uuid: uuid,
    ref: ref,
    api: api != null ? api : undefined
  });

  if (wrapWithGroup) {
    return React.createElement("group", {
      ref: ref
    }, inner);
  }

  return inner;
};
var Body = function Body(_ref2) {
  var children = _ref2.children,
      params = _ref2.params,
      bodyDef = _ref2.bodyDef,
      wrapWithGroup = _ref2.wrapWithGroup;

  var _useBody = useBody(function () {
    return bodyDef;
  }, params),
      ref = _useBody[0],
      api = _useBody[1],
      uuid = _useBody[2];

  var inner = children({
    ref: ref,
    uuid: uuid,
    api: api
  });

  if (wrapWithGroup) {
    return React.createElement("group", {
      ref: ref
    }, inner);
  }

  return inner;
};

var physicsWorkerHandler = function physicsWorkerHandler(selfWorker) {
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
        render(createElement(require('./worker/app/index').App, {
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
};

var useCollisionEvents = function useCollisionEvents(uuid, onCollideStart, onCollideEnd) {
  var _useCollisionsProvide = useCollisionsProviderContext(),
      addCollisionHandler = _useCollisionsProvide.addCollisionHandler,
      removeCollisionHandler = _useCollisionsProvide.removeCollisionHandler; // @ts-ignore


  useEffect(function () {
    if (onCollideStart) {
      addCollisionHandler(true, uuid, onCollideStart);
      return function () {
        removeCollisionHandler(true, uuid);
      };
    }
  }, [uuid, onCollideStart]); // @ts-ignore

  useEffect(function () {
    if (onCollideEnd) {
      addCollisionHandler(false, uuid, onCollideEnd);
      return function () {
        removeCollisionHandler(false, uuid);
      };
    }
  }, [uuid, onCollideEnd]);
};

export { Body, BodyShape, BodySync, BodyType, Engine, createBoxFixture, createCircleFixture, logicWorkerHandler, physicsWorkerHandler, useBody, useBodyApi, useCollisionEvents, useFixedUpdate, useOnMessage, useSendMessage, useSendSyncComponentMessage, useStoreMesh, useStoredMesh, useSubscribeMesh, useSyncWithMainComponent, withLogicWrapper };
//# sourceMappingURL=react-three-game-engine.esm.js.map
