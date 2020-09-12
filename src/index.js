import React, { Profiler } from "react";
import ReactDOM from "react-dom";
import App from "./component/App";
import "./index.css";
import "github-fork-ribbon-css/gh-fork-ribbon.css";
// import * as lodash from "lodash";

let root = document.getElementById("root");

const wtf = <App />;

ReactDOM.render(wtf, document.getElementById("root"));

// let rootFiber = root._reactRootContainer._internalRoot;

// getSet(rootFiber, "current");
// console.log("ROOT FIBER", rootFiber);

// // NOTE: memoizedState in useState fibers get replaced entirely when commit happens
// // NOTE: when a setState is called, state inside stateNode gets the memoizedSte from
// // the workInProgress tree and assign it to the instance of stateNode
// // then after checks a newState assigns to state again.

// const traverseWith = (fiber, cb) => {
//   fiber.elementType && cb(fiber);
//   fiber.child && traverseWith(fiber.child, cb);
//   fiber.sibling && traverseWith(fiber.sibling, cb);
// };

// traverseWith(rootFiber.current, fiber => {
//   // if (fiber.tag === 0 && !fiber.stateNode && fiber.memoizedState) {
//   //   // pass in "queue" obj to spy on dispatch func
//   //   console.log("attaching a spy", fiber.memoizedState.queue);
//   //   getSet(fiber.memoizedState, "baseState");
//   //   // getSet(fiber.memoizedState, "baseUpdate");
//   //   // getSet(fiber.memoizedState, "memoizedState");
//   //   // getSet(fiber.memoizedState, "next");
//   //   SpyUseState(fiber.memoizedState.queue, "dispatch");
//   //   SpyUseState(fiber.memoizedState.queue, "lastRenderedReducer");
//   // }
//   if (
//     (fiber.tag === 1 || fiber.tag === 5) &&
//     fiber.stateNode &&
//     fiber.stateNode.state
//   ) {
//     // let spy = Spy(fiber.stateNode.updater, 'enqueueSetState')
//     /*
//       enqueueReplaceState (inst, payload, callback)
//       enqueueForceUpdate (inst, callback)
//       enqueueSetState    (inst, payload, callback)
//     */
//     if (fiber.stateNode.updater) {
//       Spy(fiber.stateNode.updater, "enqueueSetState");
//       Spy(fiber.stateNode.updater, "enqueueReplaceState");
//       Spy(fiber.stateNode.updater, "enqueueForceUpdate");
//     }
//     // fiber.stateNode._state = fiber.stateNode.state;
//     // fiber.stateNode._props = fiber.stateNode.props;
//     // Object.defineProperty(fiber.stateNode, "state", {
//     //   get() {
//     //     return this._state;
//     //   },
//     //   set(val) {
//     //     this._state = val;
//     //     console.log("state after", this._state);
//     //     // console.trace();
//     //   },
//     // });
//     // Object.defineProperty(fiber.stateNode, "props", {
//     //   get() {
//     //     return this._props;
//     //   },
//     //   set(val) {
//     //     this._props = val;
//     //   },
//     // });
//     getSet(fiber.stateNode, "state");
//     if (fiber.updateQueue) {
//       getSet(fiber.updateQueue, "firstEffect");
//     }
//     // getSet(fiber.stateNode, "props");
//   }
// });

// function SpyUseState(obj, method) {
//   // let spy = {
//   //   args: [],
//   // };

//   let original = obj[method];
//   obj[method] = function(...args) {
//     console.log(method, "was called");
//     console.log(args, "arguments");
//     return original.call(obj, ...args);
//   };

//   // return spy;
// }

// function Spy(obj, method, cb) {
//   let spy = {
//     args: [],
//   };

//   let original = obj[method];
//   obj[method] = function(inst, payload, originalCb) {
//     console.log(method);
//     // console.log("payload", payload);
//     if (typeof payload === "function") {
//       // console.log("inst", lodash.cloneDeep(inst.state));
//       console.log(
//         "setState payload - with updater function",
//         payload.call(inst, inst.state), // passing inst.state since the context is not create until now.
//       );

//       const updateAction = payload.call(inst, inst.state);
//       cb(updateAction, payload, inst, inst.state);
//     } else {
//       console.log(
//         "setState payload - with object update",
//         payload, // passing inst.state since the context is not create until now.
//       );
//     }
//     // console.log("cb", cb);
//     // console.log("payload name", JSON.stringify(payload));
//     return original.call(obj, inst, payload, originalCb);
//   };

//   return spy;
// }

// function getSet(obj, propName) {
//   // fiber.stateNode._state = fiber.stateNode.state;
//   // Object.defineProperty(fiber.stateNode, "state", {
//   //   get() {
//   //     return this._state;
//   //   },
//   //   set(val) {
//   //     this._state = val;
//   //     console.log("state after", this._state);
//   //     // console.trace();
//   //   },
//   // });
//   const newPropName = `_${propName}`;
//   obj[newPropName] = obj[propName];
//   Object.defineProperty(obj, propName, {
//     get() {
//       return this[newPropName];
//     },
//     set(newVal) {
//       this[newPropName] = newVal;
//       console.log(`${obj} ${propName}`, this[newPropName]);
//       // console.trace();
//     },
//   });
//   console.log(obj, "after attaching setter getter");
// }

let changes = [];

function mountToReactRoot(reactRoot) {
  // Reset changes
  changes = [];

  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;

  changes.push(new Tree(parent.current));

  // Add listener to react fibers tree so changes can be recorded
  getSet(parent, "current");
  // Reassign react fibers tree to record initial state
  // parent.current = current;
  return changes;
}

function getSet(obj, propName) {
  const newPropName = `_${propName}`;
  obj[newPropName] = obj[propName];
  Object.defineProperty(obj, propName, {
    get() {
      return this[newPropName];
    },
    set(newVal) {
      this[newPropName] = newVal;
      console.log(`${obj} ${propName}`, this[newPropName]);
      changes.push(new Tree(this[newPropName]));
      console.log(changes);
      getTotalRenderCount();
    },
  });
}

/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(threshold) {
  const slowRenders = changes;
  // .map(flattenTree) // Flatten tree
  // .flat() // Flatten 2d array into 1d array
  // .filter(fiber => checkTime(fiber, threshold)) // filter out all that don't meet threshold
  // .map(parseCompletedNode); // removes circular references so puppeteer can stringify before sending back
  return slowRenders;
}

// function flattenTree(tree) {
//   // Closured array for storing fibers
//   const arr = [];
//   // Closured callback for adding to arr
//   const callback = fiber => {
//     arr.push(fiber);
//   };
//   traverseWith(tree, callback);
//   return arr;
// }

function checkTime(fiber, threshold) {
  return fiber.selfBaseDuration > threshold;
}

function getComponentRenderTime(componentName) {
  console.log("changes", changes);
  console.log("component name", componentName);
  // console.log(
  //   changes
  //     .map(change => change.componentList)
  //     .reduce((acc, change) => {
  //       return [...acc, ...change];
  //     }, []),
  // );
  return "what";
}

function getTotalRenderCount() {
  const componentMap = new Map();

  // loop through each commit
  // for each commit, loop through the array of trees
  // for each tree
  // check if the current component exist in the map before adding on or creating a new key
  changes.forEach(commit => {
    commit.componentList.forEach(component => {
      if (!componentMap.has(component.uID)) {
        componentMap.set(component.uID, { ...component, renderCount: 1 });
      } else {
        if (component.effectTag !== 0) {
          componentMap.get(component.uID).renderCount += 1;
        }
      }
    });
  });
  console.log("render map", componentMap);
}

class TreeNode {
  constructor(fiberNode, uID) {
    const {
      elementType,
      selfBaseDuration,
      memoizedState,
      memoizedProps,
      effectTag,
      tag,
      updateQueue,
      stateNode,
    } = fiberNode;
    this.elementType = elementType;
    this.selfBaseDuration = selfBaseDuration;
    this.memoizedProps = memoizedProps;
    this.memoizedState = memoizedState;
    this.effectTag = effectTag;
    this.updateQueue = updateQueue; // seems to be replaced entirely and since it exists directly under a fiber node, it can't be modified.
    this.uID = uID;
    this.tag = tag;
    this.updateList = [];

    // stateNode can contain circular references depends on the fiber node
    if (tag === 5) {
      this.stateNode = "host component";
    } else if (tag === 3) {
      this.stateNode = "host root";
    } else {
      this.stateNode = stateNode;
    }

    // check the fiber and the attach the spy
    // find a way to store the update function variable and result here
    if ((tag === 1 || tag === 5) && this.stateNode && this.stateNode.state) {
      /*
        enqueueReplaceState (inst, payload, callback)
        enqueueForceUpdate (inst, callback)
        enqueueSetState    (inst, payload, callback)
      */
      if (this.stateNode.updater) {
        const cb = (update, payload) => {
          this.updateList.push([update, payload]);
        };
        Spy(this.stateNode.updater, "enqueueSetState", cb);
        Spy(this.stateNode.updater, "enqueueReplaceState", cb);
        Spy(this.stateNode.updater, "enqueueForceUpdate", cb);
      }
    }

    if (tag === 0 && !stateNode && memoizedState) {
      // pass in "queue" obj to spy on dispatch func
      console.log("attaching a spy", memoizedState.queue);
      // getSet(memoizedState, "baseState");
      // getSet(fiber.memoizedState, "baseUpdate");
      // getSet(fiber.memoizedState, "memoizedState");
      // getSet(fiber.memoizedState, "next");

      const cb = (...args) => {
        this.updateList.push([...args]);
      };
      SpyUseState(memoizedState.queue, "dispatch", cb);
      SpyUseState(memoizedState.queue, "lastRenderedReducer", cb);
    }
  }

  addChild(treeNode) {
    // remove other uneccessary properties
    this.child = treeNode;
  }

  addSibling(node) {
    // if (!node) return;
  }

  addParent(node) {
    // if (!node) return;
  }
}

/* eslint-disable no-plusplus */
// This tree is used to traverse through the Fiber tree and remove circular references
// since they are not needed outside of Fiber internal use.
class Tree {
  // uniqueId is used to identify a fiber to then help with counting re-renders
  // componentList
  constructor(rootNode) {
    this.uniqueId = 0;
    this.componentList = [];
    this.effectList = [];
    this.root = null;
    this.processNode(rootNode);
  }

  processNode(fiberNode, previousTreeNode) {
    // Reference list:
    // export const FunctionComponent = 0;
    // export const ClassComponent = 1;
    // export const IndeterminateComponent = 2; // Before we know whether it is function or class
    // export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
    // export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
    // export const HostComponent = 5;
    // export const HostText = 6;
    // export const Fragment = 7;
    // export const Mode = 8;
    // export const ContextConsumer = 9;
    // export const ContextProvider = 10;
    // export const ForwardRef = 11;
    // export const Profiler = 12;
    // export const SuspenseComponent = 13;
    // export const MemoComponent = 14;
    // export const SimpleMemoComponent = 15;
    // export const LazyComponent = 16;

    // If it's a HostRoot with a tag of 3
    // create a new TreeNode
    if (fiberNode.tag === 3) {
      this.root = new TreeNode(fiberNode, this.uniqueId);
      this.componentList.push({ ...this.root }); // push a copy
      this.uniqueId++;

      if (fiberNode.child) {
        // const newNode = new TreeNode(fiberNode.child, this.uniqueId);
        // this.root.addChild(newNode);
        // this.componentList.push(newNode);
        // this.uniqueId++;
        this.processNode(fiberNode.child, this.root);
      }
    } else {
      const newNode = new TreeNode(fiberNode, this.uniqueId);
      previousTreeNode.addChild(newNode);
      this.componentList.push({ ...newNode });
      this.uniqueId++;

      if (fiberNode.child) {
        this.processNode(fiberNode.child, newNode);
      }
      if (fiberNode.sibling) {
        // do same thing for sibling
      }
    }
  }
}

// SPY STUFF

function Spy(obj, method, cb) {
  let original = obj[method];
  obj[method] = function(inst, payload, originalCb) {
    console.log(method);
    // console.log("payload", payload);
    if (typeof payload === "function") {
      // console.log("inst", lodash.cloneDeep(inst.state));
      console.log(
        "setState payload - with updater function",
        payload.call(inst, inst.state), // passing inst.state since the context is not create until now.
      );
      const update = payload.call(inst, inst.state);
      cb(update, payload);
    } else {
      console.log(
        "setState payload - with object update",
        payload, // passing inst.state since the context is not create until now.
      );
      cb(payload, null);
    }
    // console.log("cb", cb);
    // console.log("payload name", JSON.stringify(payload));
    return original.call(obj, inst, payload, cb);
  };
}

function SpyUseState(obj, method, cb) {
  let original = obj[method];
  obj[method] = function(...args) {
    console.log(method, "was called");
    console.log(args, "with arguments");
    cb(...args);
    return original.call(obj, ...args);
  };
  // return spy;
}

mountToReactRoot(root);
