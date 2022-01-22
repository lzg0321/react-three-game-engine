'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var planckJs = require('planck-js');
require('planck-js/lib');

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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var AppContext = /*#__PURE__*/React.createContext(null);
var useWorld = function useWorld() {
  return React.useContext(AppContext).world;
};
var useAppContext = function useAppContext() {
  return React.useContext(AppContext);
};

var useWorkerMessages = function useWorkerMessages(worker) {
  var idCount = React.useRef(0);
  var subscriptionsRef = React.useRef({});
  var subscribe = React.useCallback(function (callback) {
    var id = idCount.current;
    idCount.current += 1;
    subscriptionsRef.current[id] = callback;
    return function () {
      delete subscriptionsRef.current[id];
    };
  }, [subscriptionsRef]);
  React.useEffect(function () {
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

var getFixtureData = function getFixtureData(fixture) {
  var userData = fixture.getUserData();
  return userData || null;
};
var getFixtureUuid = function getFixtureUuid(data) {
  if (data && data['uuid']) {
    return data.uuid;
  }

  return '';
};
var getFixtureIndex = function getFixtureIndex(data) {
  if (data) {
    return data.fixtureIndex;
  }

  return -1;
};

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

var Context = /*#__PURE__*/React.createContext(null);
var useWorldState = function useWorldState() {
  return React.useContext(Context);
};
var WorldState = function WorldState(_ref) {
  var children = _ref.children;

  var _useState = React.useState(function () {
    return new Map();
  }),
      bodies = _useState[0];

  var _useState2 = React.useState(function () {
    return new Set();
  }),
      dynamicBodies = _useState2[0];

  var _useState3 = React.useState(function () {
    return new Set();
  }),
      collisionListeners = _useState3[0];

  var _useState4 = React.useState(false),
      bodiesNeedSync = _useState4[0],
      setBodiesNeedSync = _useState4[1];

  var bodiesNeedSyncRef = React.useRef(false);
  var logicBodiesNeedSyncRef = React.useRef(false);
  return React__default.createElement(Context.Provider, {
    value: {
      bodies: bodies,
      dynamicBodies: dynamicBodies,
      collisionListeners: collisionListeners,
      bodiesNeedSync: bodiesNeedSync,
      setBodiesNeedSync: setBodiesNeedSync,
      bodiesNeedSyncRef: bodiesNeedSyncRef,
      logicBodiesNeedSyncRef: logicBodiesNeedSyncRef
    }
  }, children);
};

var tempVec = /*#__PURE__*/planckJs.Vec2(0, 0);
var useSubscribeToWorkerMessages = function useSubscribeToWorkerMessages(messageHandler) {
  var _useAppContext = useAppContext(),
      subscribe = _useAppContext.subscribe,
      logicSubscribe = _useAppContext.logicSubscribe;

  React.useEffect(function () {
    var unsubscribe = subscribe(messageHandler);
    var unsubscribeLogic = logicSubscribe(messageHandler);
    return function () {
      unsubscribe();
      unsubscribeLogic();
    };
  }, [subscribe, logicSubscribe, messageHandler]);
};

var applyBodyConfigToExistingBody = function applyBodyConfigToExistingBody(body, data) {
  var uuid = data.uuid,
      _data$fixtures = data.fixtures,
      fixtures = _data$fixtures === void 0 ? [] : _data$fixtures,
      props = _objectWithoutPropertiesLoose(data, ["uuid", "cacheKey", "listenForCollisions", "fixtures", "attachToRope"]);

  if (fixtures && fixtures.length > 0) {
    var bodyFixture = body.getFixtureList();
    fixtures.forEach(function (fixture, fixtureIndex) {
      var _fixtureOptions;

      var fixtureOptions = fixture.fixtureOptions;
      fixtureOptions = _extends({
        userData: _extends({
          uuid: uuid,
          fixtureIndex: fixtureIndex
        }, (_fixtureOptions = fixtureOptions) == null ? void 0 : _fixtureOptions.userData)
      }, fixtureOptions);

      if (bodyFixture) {
        if (fixtureOptions) {
          bodyFixture.setUserData(fixtureOptions.userData);
        }

        bodyFixture = bodyFixture.getNext();
      }
    });
  }

  var position = props.position,
      angle = props.angle;

  if (position) {
    body.setPosition(position);
  }

  if (angle) {
    body.setAngle(angle);
  }

  body.setActive(true);
  return body;
};

var useAddBody = function useAddBody(bodies, cachedBodies) {
  var _useWorldState = useWorldState(),
      dynamicBodies = _useWorldState.dynamicBodies,
      collisionListeners = _useWorldState.collisionListeners,
      bodiesNeedSyncRef = _useWorldState.bodiesNeedSyncRef,
      logicBodiesNeedSyncRef = _useWorldState.logicBodiesNeedSyncRef;

  var addDynamicBody = React.useCallback(function (uuid) {
    dynamicBodies.add(uuid);
    bodiesNeedSyncRef.current = true;
    logicBodiesNeedSyncRef.current = true;
  }, [dynamicBodies, bodiesNeedSyncRef, logicBodiesNeedSyncRef]);
  var addCollisionListeners = React.useCallback(function (uuid) {
    collisionListeners.add(uuid);
  }, [collisionListeners]);
  var world = useWorld();
  var getCachedBody = React.useCallback(function (cacheKey) {
    var cached = cachedBodies.get(cacheKey);

    if (cached && cached.length > 0) {
      var body = cached.pop();

      if (body) {
        return body;
      }
    }

    return null;
  }, [cachedBodies]);
  return React.useCallback(function (data) {
    var uuid = data.uuid,
        cacheKey = data.cacheKey,
        listenForCollisions = data.listenForCollisions,
        _data$fixtures2 = data.fixtures,
        fixtures = _data$fixtures2 === void 0 ? [] : _data$fixtures2,
        _data$attachToRope2 = data.attachToRope,
        attachToRope = _data$attachToRope2 === void 0 ? false : _data$attachToRope2,
        props = _objectWithoutPropertiesLoose(data, ["uuid", "cacheKey", "listenForCollisions", "fixtures", "attachToRope"]);

    var existingBody = bodies.get(uuid);

    if (existingBody) {
      return existingBody;
    }

    if (listenForCollisions) {
      addCollisionListeners(uuid);
    }

    var bodyDef = _extends({
      type: BodyType["static"],
      fixedRotation: true
    }, props);

    var type = bodyDef.type;
    var body = null;

    if (cacheKey) {
      var cachedBody = getCachedBody(cacheKey);

      if (cachedBody) {
        body = applyBodyConfigToExistingBody(cachedBody, data);
      }
    }

    if (!body) {
      body = world.createBody(bodyDef);

      if (fixtures && fixtures.length > 0) {
        fixtures.forEach(function (fixture, fixtureIndex) {
          var _fixture$fixtureOptio, _fixtureOptions2;

          var shape = fixture.shape;
          var fixtureOptions = (_fixture$fixtureOptio = fixture.fixtureOptions) != null ? _fixture$fixtureOptio : {};
          fixtureOptions = _extends({}, fixtureOptions, {
            userData: _extends({
              uuid: uuid,
              fixtureIndex: fixtureIndex
            }, (_fixtureOptions2 = fixtureOptions) == null ? void 0 : _fixtureOptions2.userData)
          });
          var bodyShape;

          switch (shape) {
            case BodyShape.box:
              var hx = fixture.hx,
                  hy = fixture.hy,
                  center = fixture.center,
                  angle = fixture.angle;
              bodyShape = planckJs.Box(hx / 2, hy / 2, center ? planckJs.Vec2(center[0], center[1]) : undefined, angle);
              break;

            case BodyShape.circle:
              var radius = fixture.radius,
                  position = fixture.position;

              if (position) {
                bodyShape = planckJs.Circle(planckJs.Vec2(position[0], position[1]), radius);
              } else {
                bodyShape = planckJs.Circle(radius);
              }

              break;

            default:
              throw new Error("Unhandled body shape " + shape);
          }

          if (fixtureOptions) {
            if (body) {
              body.createFixture(bodyShape, fixtureOptions);
            }
          } else {
            if (body) {
              body.createFixture(bodyShape);
            }
          } // todo - handle rope properly...


          if (attachToRope) {
            var _position = props.position,
                _angle = props.angle;
            var ropeJointDef = {
              maxLength: 0.5,
              localAnchorA: _position,
              localAnchorB: _position
            };
            var startingBodyDef = {
              type: BodyType["static"],
              fixedRotation: true,
              position: _position,
              angle: _angle
            };
            var startingBody = world.createBody(startingBodyDef);

            if (body) {
              var distanceJoint = planckJs.DistanceJoint({
                collideConnected: false,
                frequencyHz: 5,
                dampingRatio: 0.5,
                length: 0.15
              }, startingBody, body, _position != null ? _position : planckJs.Vec2(0, 0), _position != null ? _position : planckJs.Vec2(0, 0));
              var rope2 = world.createJoint(planckJs.RopeJoint(ropeJointDef, startingBody, body, _position != null ? _position : planckJs.Vec2(0, 0)));
              var rope = world.createJoint(distanceJoint);
            }
          }
        });
      }
    }

    if (type !== BodyType["static"]) {
      addDynamicBody(uuid);
    }

    if (!body) {
      throw new Error("No body");
    }

    bodies.set(uuid, body);
    return body;
  }, [world, bodies, getCachedBody, addDynamicBody, addCollisionListeners]);
};

var useRemoveBody = function useRemoveBody(bodies, cachedBodies) {
  var world = useWorld();

  var _useWorldState2 = useWorldState(),
      dynamicBodies = _useWorldState2.dynamicBodies,
      collisionListeners = _useWorldState2.collisionListeners,
      bodiesNeedSyncRef = _useWorldState2.bodiesNeedSyncRef,
      logicBodiesNeedSyncRef = _useWorldState2.logicBodiesNeedSyncRef;

  return React.useCallback(function (_ref) {
    var uuid = _ref.uuid,
        cacheKey = _ref.cacheKey;

    if (dynamicBodies.has(uuid)) {
      dynamicBodies["delete"](uuid);
      bodiesNeedSyncRef.current = true;
      logicBodiesNeedSyncRef.current = true;
    }

    collisionListeners["delete"](uuid);
    var body = bodies.get(uuid);

    if (!body) {
      console.warn("Body not found for " + uuid);
      return;
    }

    bodies["delete"](uuid);

    if (cacheKey) {
      tempVec.set(-1000, -1000);
      body.setPosition(tempVec);
      tempVec.set(0, 0);
      body.setLinearVelocity(tempVec);
      body.setActive(false);
      var cached = cachedBodies.get(cacheKey);

      if (cached) {
        cached.push(body);
      } else {
        cachedBodies.set(cacheKey, [body]);
      }
    } else {
      world.destroyBody(body);
    }
  }, [world, bodies, dynamicBodies, collisionListeners, bodiesNeedSyncRef, logicBodiesNeedSyncRef, cachedBodies]);
};

var useSetBody = function useSetBody(bodies) {
  return React.useCallback(function (_ref2) {
    var uuid = _ref2.uuid,
        method = _ref2.method,
        methodParams = _ref2.methodParams;
    var body = bodies.get(uuid);

    if (!body) {
      console.warn("Body not found for " + uuid, bodies);
      return;
    }

    switch (method) {
      default:
        body[method].apply(body, methodParams);
    }
  }, [bodies]);
};

var useUpdateBody = function useUpdateBody(bodies) {
  return React.useCallback(function (_ref3) {
    var uuid = _ref3.uuid,
        data = _ref3.data;
    var body = bodies.get(uuid);

    if (!body) {
      console.warn("Body not found for " + uuid);
      return;
    }

    var fixtureUpdate = data.fixtureUpdate;

    if (fixtureUpdate) {
      var fixture = body.getFixtureList();

      if (fixture) {
        var groupIndex = fixtureUpdate.groupIndex,
            categoryBits = fixtureUpdate.categoryBits,
            maskBits = fixtureUpdate.maskBits;

        if (groupIndex !== undefined || categoryBits !== undefined || maskBits !== undefined) {
          var originalGroupIndex = fixture.getFilterGroupIndex();
          var originalCategoryBits = fixture.getFilterCategoryBits();
          var originalMaskBits = fixture.getFilterMaskBits();
          fixture.setFilterData({
            groupIndex: groupIndex !== undefined ? groupIndex : originalGroupIndex,
            categoryBits: categoryBits !== undefined ? categoryBits : originalCategoryBits,
            maskBits: maskBits !== undefined ? maskBits : originalMaskBits
          });
        }
      }
    }
  }, [bodies]);
};

var Bodies = function Bodies() {
  var _useWorldState3 = useWorldState(),
      bodies = _useWorldState3.bodies;

  var _useState = React.useState(function () {
    return new Map();
  }),
      cachedBodies = _useState[0];

  var addBody = useAddBody(bodies, cachedBodies);
  var removeBody = useRemoveBody(bodies, cachedBodies);
  var setBody = useSetBody(bodies);
  var updateBody = useUpdateBody(bodies);
  var onMessage = React.useCallback(function (event) {
    var _event$data = event.data,
        type = _event$data.type,
        _event$data$props = _event$data.props,
        props = _event$data$props === void 0 ? {} : _event$data$props;

    switch (type) {
      case WorkerMessageType.ADD_BODY:
        addBody(props);
        break;

      case WorkerMessageType.REMOVE_BODY:
        removeBody(props);
        break;

      case WorkerMessageType.SET_BODY:
        setBody(props);
        break;

      case WorkerMessageType.UPDATE_BODY:
        updateBody(props);
        break;
    }
  }, [addBody, removeBody, setBody, updateBody]);
  useSubscribeToWorkerMessages(onMessage);
  return null;
};

var generateBuffers = function generateBuffers(maxNumberOfDynamicObjects) {
  return {
    positions: new Float32Array(maxNumberOfDynamicObjects * 2),
    angles: new Float32Array(maxNumberOfDynamicObjects)
  };
};
var useBuffers = function useBuffers(maxNumberOfDynamicObjects, debug) {
  var isMountRef = React.useRef(true);

  var _useState = React.useState(function () {
    return generateBuffers(maxNumberOfDynamicObjects);
  }),
      buffers = _useState[0];

  React.useEffect(function () {
    if (isMountRef.current) {
      isMountRef.current = false;
      return;
    }

    var _generateBuffers = generateBuffers(maxNumberOfDynamicObjects),
        positions = _generateBuffers.positions,
        angles = _generateBuffers.angles;

    buffers.positions = positions;
    buffers.angles = angles;
  }, [maxNumberOfDynamicObjects]);
  return buffers;
};

var useSyncData = function useSyncData() {
  var _useWorldState = useWorldState(),
      dynamicBodies = _useWorldState.dynamicBodies,
      bodies = _useWorldState.bodies;

  return React.useCallback(function (positions, angles) {
    var dynamicBodiesArray = Array.from(dynamicBodies);
    dynamicBodiesArray.forEach(function (uuid, index) {
      var body = bodies.get(uuid);
      if (!body) return;
      var position = body.getPosition();
      var angle = body.getAngle();
      positions[2 * index + 0] = position.x;
      positions[2 * index + 1] = position.y;
      angles[index] = angle;
    });
  }, []);
};

var useSendPhysicsUpdate = function useSendPhysicsUpdate(tickRef) {
  var localStateRef = React.useRef({
    failedMainCount: 0,
    failedLogicCount: 0,
    lastPhysicsStep: 0
  });

  var _useWorldState2 = useWorldState(),
      bodiesNeedSyncRef = _useWorldState2.bodiesNeedSyncRef,
      logicBodiesNeedSyncRef = _useWorldState2.logicBodiesNeedSyncRef,
      dynamicBodies = _useWorldState2.dynamicBodies;

  var _useAppContext = useAppContext(),
      mainBuffers = _useAppContext.buffers,
      logicBuffers = _useAppContext.logicBuffers,
      maxNumberOfDynamicObjects = _useAppContext.maxNumberOfDynamicObjects;

  var syncData = useSyncData();
  return React.useCallback(function (target, buffer, isMain) {
    var positions = buffer.positions,
        angles = buffer.angles;

    if (!(positions.byteLength !== 0 && angles.byteLength !== 0)) {
      console.warn('cant send physics update to', isMain ? 'main' : 'logic');

      if (isMain) {
        if (localStateRef.current.failedMainCount >= 2) {
          var _generateBuffers = generateBuffers(maxNumberOfDynamicObjects),
              newPositions = _generateBuffers.positions,
              newAngles = _generateBuffers.angles;

          mainBuffers.positions = newPositions;
          mainBuffers.angles = newAngles;
        }
      } else {
        if (localStateRef.current.failedLogicCount >= 2) {
          var _generateBuffers2 = generateBuffers(maxNumberOfDynamicObjects),
              _newPositions = _generateBuffers2.positions,
              _newAngles = _generateBuffers2.angles;

          logicBuffers.positions = _newPositions;
          logicBuffers.angles = _newAngles;
        }
      }

      if (isMain) {
        localStateRef.current.failedMainCount += 1;
      } else {
        localStateRef.current.failedLogicCount += 1;
      }

      return;
    }

    if (isMain) {
      localStateRef.current.failedMainCount = 0;
    } else {
      localStateRef.current.failedLogicCount = 0;
    }

    syncData(positions, angles);
    var rawMessage = {
      type: WorkerOwnerMessageType.PHYSICS_STEP,
      physicsTick: tickRef.current
    };

    if (isMain) {
      rawMessage.bodies = Array.from(dynamicBodies);
      bodiesNeedSyncRef.current = false;
    } else {
      rawMessage.bodies = Array.from(dynamicBodies);
      logicBodiesNeedSyncRef.current = false;
    }

    var message = _extends({}, rawMessage, {
      positions: positions,
      angles: angles
    });

    target.postMessage(message, [positions.buffer, angles.buffer]);
  }, [bodiesNeedSyncRef, logicBodiesNeedSyncRef, tickRef, syncData]);
};

var useSendPhysicsUpdates = function useSendPhysicsUpdates(tickRef) {
  var _useAppContext2 = useAppContext(),
      mainBuffers = _useAppContext2.buffers,
      logicBuffers = _useAppContext2.logicBuffers,
      worker = _useAppContext2.worker,
      logicWorker = _useAppContext2.logicWorker;

  var sendPhysicsUpdate = useSendPhysicsUpdate(tickRef);
  var update = React.useCallback(function (isMain) {
    if (isMain) {
      sendPhysicsUpdate(worker, mainBuffers, true);
    } else if (logicWorker) {
      sendPhysicsUpdate(logicWorker, logicBuffers, false);
    }
  }, [worker, logicWorker, sendPhysicsUpdate, mainBuffers, logicBuffers]);
  var updateRef = React.useRef(update);
  React.useEffect(function () {
    updateRef.current = update;
  }, [update, updateRef]);
  return React.useCallback(function (isMain) {
    // using ref, as i don't want to interrupt the interval
    updateRef.current(isMain);
  }, [updateRef]);
};

var useStepProcessed = function useStepProcessed(tickRef) {
  var _useAppContext3 = useAppContext(),
      mainBuffers = _useAppContext3.buffers,
      logicBuffers = _useAppContext3.logicBuffers,
      worker = _useAppContext3.worker,
      logicWorker = _useAppContext3.logicWorker;

  return React.useCallback(function (isMain, lastProcessedPhysicsTick, positions, angles) {
    var buffers = isMain ? mainBuffers : logicBuffers;

    if (isMain) {
      buffers.positions = positions;
      buffers.angles = angles;
    } else {
      buffers.positions = positions;
      buffers.angles = angles;
    }
  }, [mainBuffers, logicBuffers, tickRef, worker, logicWorker]);
};

var useWorldLoop = function useWorldLoop() {
  var world = useWorld();

  var _useAppContext4 = useAppContext(),
      updateRate = _useAppContext4.updateRate,
      subscribe = _useAppContext4.subscribe,
      logicSubscribe = _useAppContext4.logicSubscribe;

  var tickRef = React.useRef(0);

  var _useState = React.useState(0),
      tickCount = _useState[0],
      setTickCount = _useState[1];

  var lastSentMainUpdateRef = React.useRef(-1);
  var lastSentLogicUpdateRef = React.useRef(-1);

  var _useState2 = React.useState(false),
      mainBufferReady = _useState2[0],
      setMainBufferReady = _useState2[1];

  var _useState3 = React.useState(false),
      logicBufferReady = _useState3[0],
      setLogicBufferReady = _useState3[1];

  var sendPhysicsUpdate = useSendPhysicsUpdates(tickRef);
  React.useEffect(function () {
    if (mainBufferReady && lastSentMainUpdateRef.current < tickCount) {
      sendPhysicsUpdate(true);
      lastSentMainUpdateRef.current = tickCount;
      setMainBufferReady(false);
    }
  }, [tickCount, mainBufferReady]);
  React.useEffect(function () {
    if (logicBufferReady && lastSentLogicUpdateRef.current < tickCount) {
      sendPhysicsUpdate(false);
      lastSentLogicUpdateRef.current = tickCount;
      setLogicBufferReady(false);
    }
  }, [tickCount, logicBufferReady]);
  React.useEffect(function () {
    var step = function step() {
      world.step(updateRate);
    };

    var interval = setInterval(function () {
      tickRef.current += 1;
      setTickCount(function (state) {
        return state + 1;
      });
      step();
    }, updateRate);
    return function () {
      clearInterval(interval);
    };
  }, []);
  var stepProcessed = useStepProcessed(tickRef);
  React.useEffect(function () {
    var onMessage = function onMessage(event, isMain) {
      if (isMain === void 0) {
        isMain = true;
      }

      var _event$data = event.data,
          type = _event$data.type;

      if (type === WorkerMessageType.READY_FOR_PHYSICS) {
        if (isMain) {
          setMainBufferReady(true);
        } else {
          setLogicBufferReady(true);
        }
      } else if (type === WorkerMessageType.PHYSICS_STEP_PROCESSED) {
        stepProcessed(isMain, event.data.physicsTick, event.data.positions, event.data.angles);

        if (isMain) {
          setMainBufferReady(true);
        } else {
          setLogicBufferReady(true);
        }
      }
    };

    var unsubscribe = subscribe(onMessage);
    var unsubscribeLogic = logicSubscribe(function (event) {
      return onMessage(event, false);
    });
    return function () {
      unsubscribe();
      unsubscribeLogic();
    };
  }, [subscribe, logicSubscribe, stepProcessed]);
};

var World = function World() {
  useWorldLoop();
  return null;
};

var useSubscribeLogicWorker = function useSubscribeLogicWorker(worker) {
  var subscribe = useWorkerMessages(worker);
  return subscribe;
};
var useLogicWorker = function useLogicWorker(worker, subscribe) {
  var _useState = React.useState(),
      logicWorker = _useState[0],
      setLogicWorker = _useState[1];

  React.useEffect(function () {
    var logicWorkerPort;

    var handleMessage = function handleMessage(event) {
      if (event.data.command === 'connect') {
        logicWorkerPort = event.ports[0];
        setLogicWorker(logicWorkerPort);
        return;
      } else if (event.data.command === 'forward') {
        logicWorkerPort.postMessage(event.data.message);
        return;
      }
    };

    var unsubscribe = subscribe(function (event) {
      if (event.data.command) {
        handleMessage(event);
      }
    });
    return function () {
      unsubscribe();
    };
  }, [worker, subscribe, setLogicWorker]);
  return logicWorker;
};

var useHandleBeginCollision = function useHandleBeginCollision() {
  var _useAppContext = useAppContext(),
      worker = _useAppContext.worker,
      logicWorker = _useAppContext.logicWorker;

  var _useWorldState = useWorldState(),
      collisionListeners = _useWorldState.collisionListeners;

  var sendCollisionBeginEvent = React.useCallback(function (uuid, data, fixtureIndex, collidedFixtureIndex, isSensor) {
    var update = {
      type: WorkerOwnerMessageType.BEGIN_COLLISION,
      props: {
        uuid: uuid,
        data: data,
        fixtureIndex: fixtureIndex,
        collidedFixtureIndex: collidedFixtureIndex,
        isSensor: isSensor
      }
    };
    worker.postMessage(update);

    if (logicWorker) {
      logicWorker.postMessage(update);
    }
  }, [worker, logicWorker]);
  return React.useCallback(function (fixtureA, fixtureB) {
    var aData = getFixtureData(fixtureA);
    var bData = getFixtureData(fixtureB);
    var aUUID = getFixtureUuid(aData);
    var bUUID = getFixtureUuid(bData);

    if (aUUID && collisionListeners.has(aUUID)) {
      sendCollisionBeginEvent(aUUID, bData, getFixtureIndex(aData), getFixtureIndex(bData), fixtureB.isSensor());
    }

    if (bUUID && collisionListeners.has(bUUID)) {
      sendCollisionBeginEvent(bUUID, aData, getFixtureIndex(bData), getFixtureIndex(aData), fixtureA.isSensor());
    }
  }, [collisionListeners, sendCollisionBeginEvent]);
};

var useHandleEndCollision = function useHandleEndCollision() {
  var _useAppContext2 = useAppContext(),
      worker = _useAppContext2.worker,
      logicWorker = _useAppContext2.logicWorker;

  var _useWorldState2 = useWorldState(),
      collisionListeners = _useWorldState2.collisionListeners;

  var sendCollisionEndEvent = React.useCallback(function (uuid, data, fixtureIndex, collidedFixtureIndex, isSensor) {
    var update = {
      type: WorkerOwnerMessageType.END_COLLISION,
      props: {
        uuid: uuid,
        data: data,
        fixtureIndex: fixtureIndex,
        collidedFixtureIndex: collidedFixtureIndex,
        isSensor: isSensor
      }
    };
    worker.postMessage(update);

    if (logicWorker) {
      logicWorker.postMessage(update);
    }
  }, [worker, logicWorker]);
  return React.useCallback(function (fixtureA, fixtureB) {
    var aData = getFixtureData(fixtureA);
    var bData = getFixtureData(fixtureB);
    var aUUID = getFixtureUuid(aData);
    var bUUID = getFixtureUuid(bData);

    if (aUUID && collisionListeners.has(aUUID)) {
      sendCollisionEndEvent(aUUID, bData, getFixtureIndex(aData), getFixtureIndex(bData), fixtureB.isSensor());
    }

    if (bUUID && collisionListeners.has(bUUID)) {
      sendCollisionEndEvent(bUUID, aData, getFixtureIndex(bData), getFixtureIndex(aData), fixtureA.isSensor());
    }
  }, [collisionListeners, sendCollisionEndEvent]);
};

var Collisions = function Collisions() {
  var world = useWorld();
  var handleBeginCollision = useHandleBeginCollision();
  var handleEndCollision = useHandleEndCollision();
  React.useEffect(function () {
    world.on('begin-contact', function (contact) {
      var fixtureA = contact.getFixtureA();
      var fixtureB = contact.getFixtureB();
      handleBeginCollision(fixtureA, fixtureB);
    });
    world.on('end-contact', function (contact) {
      var fixtureA = contact.getFixtureA();
      var fixtureB = contact.getFixtureB();
      handleEndCollision(fixtureA, fixtureB);
    });
  }, [world]);
  return null;
};

var App = function App(_ref) {
  var worldParams = _ref.worldParams,
      worker = _ref.worker,
      config = _ref.config;
  var updateRate = config.updateRate,
      maxNumberOfDynamicObjects = config.maxNumberOfDynamicObjects;

  var defaultParams = _extends({
    allowSleep: true,
    gravity: planckJs.Vec2(0, 0)
  }, worldParams);

  var _useState = React.useState(function () {
    return planckJs.World(defaultParams);
  }),
      world = _useState[0];

  var subscribe = useWorkerMessages(worker);
  var logicWorker = useLogicWorker(worker, subscribe);
  var logicSubscribe = useSubscribeLogicWorker(logicWorker);
  var buffers = useBuffers(maxNumberOfDynamicObjects);
  var logicBuffers = useBuffers(!logicWorker ? 0 : maxNumberOfDynamicObjects);
  var buffersRef = React.useRef({
    mainCount: 0,
    logicCount: 0
  });
  React.useEffect(function () {
    worker.postMessage({
      type: WorkerOwnerMessageType.INITIATED
    });
  }, [worker]);
  return React__default.createElement(AppContext.Provider, {
    value: {
      world: world,
      updateRate: updateRate,
      worker: worker,
      logicWorker: logicWorker,
      subscribe: subscribe,
      logicSubscribe: logicSubscribe,
      buffers: buffers,
      logicBuffers: logicBuffers,
      buffersRef: buffersRef,
      maxNumberOfDynamicObjects: maxNumberOfDynamicObjects
    }
  }, React__default.createElement(WorldState, null, React__default.createElement(World, null), React__default.createElement(Bodies, null), React__default.createElement(Collisions, null)));
};

exports.App = App;
//# sourceMappingURL=physicsapp.cjs.development.js.map
