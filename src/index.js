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

let changes = [];
const processedFibers = new WeakMap();
const fiberMap = new Map();
const testWeakSet = new WeakSet();
const stateNodeWeakSet = new WeakSet();

function mountToReactRoot(reactRoot) {
  // Reset changes
  changes = [];

  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;

  console.log("ROOT FIBER", parent.current);
  changes.push(new Tree(parent.current));
  // after initial
  // console.log("Initial processed fibers", processedFibers);
  console.log("initial fiberMap", fiberMap);

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
      console.log("CHANGES", changes);
      // console.log("Fiber STORE: ", processedFibers);
      console.log("testweakset after", testWeakSet);
      // console.log("statenodeweakset", stateNodeWeakSet);
      // console.log("fiber map:", fiberMap);
      getTotalRenderCount();
      // whatChanged();
    },
  });
}

/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(threshold) {
  const slowRenders = changes;
  return slowRenders;
}

function checkTime(fiber, threshold) {
  return fiber.selfBaseDuration > threshold;
}

function getComponentRenderTime(componentName) {
  console.log("changes", changes);
  console.log("component name", componentName);

  return "what";
}

function getTotalRenderCount() {
  const componentMap = new Map();

  // loop through each commit
  // for each commit, loop through the array of trees
  // for each tree
  // check if the current component exist in the map before adding on or creating a new key
  changes.forEach((commit, commitIndex) => {
    commit.componentList.forEach((component, componentIndex) => {
      if (!componentMap.has(component.uID)) {
        componentMap.set(component.uID, { renderCount: 1 });
      } else {
        if (
          didFiberRender(
            changes[commitIndex ? commitIndex - 1 : 0].componentList[
              componentIndex
            ],
            component,
          )
        ) {
          componentMap.get(component.uID).renderCount += 1;
        }
      }
    });
  });
  return componentMap;
}

function didFiberRender(prevFiber, nextFiber) {
  switch (nextFiber.tag) {
    case 0:
    case 1:
    case 3:
      // case 5:
      return (nextFiber.effectTag & 1) === 1;
    default:
      return (
        prevFiber.memoizedProps !== nextFiber.memoizedProps ||
        prevFiber.memoizedState !== nextFiber.memoizedState ||
        prevFiber.ref !== nextFiber.ref
      );
  }
}

function didHooksChange(previous, next) {
  if (previous == null || next == null) {
    return false;
  }
  console.log("got here");
  if (
    next.hasOwnProperty("baseState") &&
    next.hasOwnProperty("memoizedState") &&
    next.hasOwnProperty("next") &&
    next.hasOwnProperty("queue")
  ) {
    if (next.memoizedState !== previous.memoizedState) {
      return true;
    } else {
    }
  }
  return false;
}

function getChangedKeys(previous, next) {
  if (prev == null || next == null) {
    return null;
  }
  // We can't report anything meaningful for hooks changes.
  if (
    next.hasOwnProperty("baseState") &&
    next.hasOwnProperty("memoizedState") &&
    next.hasOwnProperty("next") &&
    next.hasOwnProperty("queue")
  ) {
    return null;
  }

  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const changedKeys = [];
  // eslint-disable-next-line no-for-of-loops/no-for-of-loops
  for (const key of keys) {
    if (prev[key] !== next[key]) {
      changedKeys.push(key);
    }
  }

  return changedKeys;
}

class TreeNode {
  constructor(fiberNode, uID) {
    this.uID = uID;
    const {
      elementType,
      selfBaseDuration,
      memoizedState,
      memoizedProps,
      effectTag,
      tag,
      ref,
      updateQueue,
      stateNode,
    } = fiberNode;
    this.elementType = elementType;
    this.selfBaseDuration = selfBaseDuration;
    this.memoizedProps = memoizedProps;
    this.memoizedState = memoizedState;
    this.effectTag = effectTag;
    this.ref = ref;
    this.updateQueue = updateQueue; // seems to be replaced entirely and since it exists directly under a fiber node, it can't be modified.
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
        if (!stateNodeWeakSet.has(this.stateNode)) {
          stateNodeWeakSet.add(this.stateNode);
          Spy(this.stateNode.updater, "enqueueSetState", cb);
          Spy(this.stateNode.updater, "enqueueReplaceState", cb);
          Spy(this.stateNode.updater, "enqueueForceUpdate", cb);
        }
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
      //type is function and thus it's unique
      if (!testWeakSet.has(fiberNode.type)) {
        testWeakSet.add(fiberNode.type);
        SpyUseState(memoizedState.queue, "dispatch", cb);
        SpyUseState(memoizedState.queue, "lastRenderedReducer", cb);
      }
    }
  }

  addChild(treeNode) {
    // remove other uneccessary properties
    this.child = treeNode;
  }

  addSibling(treeNode) {
    // if (!node) return;
    this.sibling = treeNode;
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
    this.uniqueId = fiberMap.size;
    this.componentList = [];
    this.effectList = [];
    this.root = null;
    this.processNode(rootNode);
  }

  processNode(fiberNode, previousTreeNode) {
    // id used to reference a fiber in fiberMap
    let id = undefined;
    // using a unique part of each fiber to identify it.
    // both current and alternate only 1 reference to this unique part
    // which we can use to uniquely identify a fiber node even in the case
    // of current and alternate switching per commit/
    let uniquePart = undefined;

    // unique part of a fiber node depends on its type.
    if (fiberNode.tag === 0) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.memoizedState.element.type;
    } else {
      uniquePart = fiberNode.stateNode;
    }
    // if this is a unique fiber (that both "current" and "alternate" fiber represents)
    // then add to the processedFiber to make sure we don't re-account this fiber.
    if (!processedFibers.has(uniquePart)) {
      // processedFibers.add(fiberNode);
      // componentMap.set(this.uniqueId, fiberNode);
      id = this.uniqueId;
      this.uniqueId++;

      fiberMap.set(id, fiberNode);
      // if (fiberNode.tag === 0) {
      //   processedFibers.set(fiberNode.elementType, id);
      // } else if (fiberNode.tag === 3) {
      //   processedFibers.set(fiberNode.memoizedState.element.type, id);
      // } else {
      //   processedFibers.set(fiberNode.stateNode, id);
      // }
      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    }

    // If it's a HostRoot with a tag of 3
    // create a new TreeNode
    if (fiberNode.tag === 3) {
      this.root = new TreeNode(fiberNode, id);
      // this.root = new TreeNode(fiberNode, this.uniqueId);
      this.componentList.push({ ...this.root }); // push a copy
      // this.uniqueId++;

      if (fiberNode.child) {
        // const newNode = new TreeNode(fiberNode.child, this.uniqueId);
        // this.root.addChild(newNode);
        // this.componentList.push(newNode);
        // this.uniqueId++;
        this.processNode(fiberNode.child, this.root);
      }
    } else {
      const newNode = new TreeNode(fiberNode, id);
      // const newNode = new TreeNode(fiberNode, this.uniqueId);
      previousTreeNode.addChild(newNode);
      this.componentList.push({ ...newNode });
      // this.uniqueId++;

      if (fiberNode.child) {
        this.processNode(fiberNode.child, newNode);
      }
      if (fiberNode.sibling) {
        this.processSiblingNode(fiberNode.sibling, newNode);
      }
    }
  }

  processSiblingNode(fiberNode, previousTreeNode) {
    let uniquePart = undefined;
    let id = undefined;
    if (fiberNode.tag === 0) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.memoizedState.element.type;
    } else {
      uniquePart = fiberNode.stateNode;
    }
    if (!processedFibers.has(uniquePart)) {
      // processedFibers.add(fiberNode);
      // componentMap.set(this.uniqueId, fiberNode);
      id = this.uniqueId;
      this.uniqueId++;
      fiberMap.set(id, fiberNode);
      // if (fiberNode.tag === 0) {
      //   processedFibers.set(fiberNode.elementType, id);
      // } else if (fiberNode.tag === 3) {
      //   processedFibers.set(fiberNode.memoizedState.element.type, id);
      // } else {
      //   processedFibers.set(fiberNode.stateNode, id);
      // }
      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    }

    const newNode = new TreeNode(fiberNode, id);
    // const newNode = new TreeNode(fiberNode, this.uniqueId);
    previousTreeNode.addSibling(newNode);
    this.componentList.push({ ...newNode });
    // this.uniqueId++;

    if (fiberNode.child) {
      this.processNode(fiberNode.child, newNode);
    }
    if (fiberNode.sibling) {
      this.processSiblingNode(fiberNode.sibling, newNode);
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

let copyOfChanges = [...changes];

copyOfChanges.forEach(commit => {});

// changes[0].root.child.stateNode.setState({
//   total: 0,
//   next: 10,
//   operation: null,
// });

console.log("processed fibers", processedFibers);
// console.log("testWeakSET:", testWeakSet);
// console.log("stateNodeWeakSet", stateNodeWeakSet);
// console.log(processedFibers.get(2));

// setTimeout(() => {
//   processedFibers.get(2).stateNode.setState({
//     total: "0",
//     next: "10",
//     operation: null,
//   });
// }, 4000);

// setTimeout(() => {
//   processedFibers.get(4).memoizedState.queue.dispatch(1);
// }, 4000);

// setTimeout(() => {
//   processedFibers.get(4).memoizedState.queue.dispatch(3);
// }, 6000);

// maybe i should have a weak set to determine whether a fiber is processed
// add/change fiber depends on the order/time that it was called

// 1st commit -> add to WeakSet-1
// 2nd commit -> add to WeakSet2
// 3rd commit -> add more to Weakset1 if needed
// 4th commit -> add to WeakSet2 if needed.

//weakset and weakmap are not suitable for accessing the values to then set the state

// what are the constraints?
// custom structure would need to be serializable
//
// changes array should be a stack, pop the last of the stack to process and call setState if there are any

// now i think it's best to traverse the previous commit and apply the state that was there before if you want to travel

// a structure that stores relevant data of each commit,
// how to make sure that when we process a current or alternate that we know they are related/pointing to the same custom object?

// CustomTree
// root -> contains all component/fiber -> each fiber stores details about the current state and previous renders' states.
//         also each node in this would contain the stateNode or memoizedState's dispatch in order to time travel when needed.
//         when time travel, set a mode so that new commits won't be recorded. Or when the time travel function is called
//         new commit's changes should be discarded. So when that "time-travel" commit is detected, reset the mode.
// each node: would store similar properties but in an array.
// a serialize method: serialize the custom tree so that there will be no circular references.

//if that structure doesn't work, fall back to having different commits and compare the component inside that commit tree with the map
// that would store the unique components to make sure they are the same across different commits before processing.
