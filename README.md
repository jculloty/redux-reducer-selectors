# redux-reducer-selectors
---
#### Automatically maps Redux selectors to the rootReducer when combining reducers.
redux-reducer-selectors wraps Redux's **combineReducers()** method to map each reducer's selectors to the correct state slice of the root reducer.

- The individual reducer files remain unaltered
-- Provided the reducer is the default export and the selectors are named exports (standard practice)
- Works with [Reselect](https://github.com/reactjs/reselect.git)
- The entire module's contents are imported for each reducer
- All selectors are exported as a single Selectors object

#### Example
```javascript
import combineReducerMapSelectors from 'redux-reducer-selectors'
import * as todos from './todos'
import * as counter from './counter'

const { rootReducer, selectors } = combineReducerMapSelectors({
  todos,
  counter
})

export default rootReducer
export { selectors as Selectors }
```
---
[![NPM](https://nodei.co/npm/redux-reducer-selectors.png)](https://npmjs.org/package/redux-reducer-selectors)

## Motivation
> A Selector is a store getter in Redux.

Instead of directly accessing the store's state; selectors should be used to allow for easier refactoring and to ensure that the rest of the application is not tied to the store's internal state.

#### reducers/todos.js
```javascript
// The reducer is usually the default export
export default function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}

// The selectors are named exports
export getTodos = (state) => state
export getTodoCount = (state) => state.length
export getFirstTodo = (state) => state[0]
export getTodo = (state, index) => state[index]
```
#### reducers/counter.js
```javascript
// The reducer is usually the default export
export default function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

// The selectors are named exports
export getCounter = (state) => state
```
Typically selectors will be used in **mapStateToProps()** instead of directly accessing the state's properties.

```javascript
import { getTodos, getTodoCount } from './reducers/todos'
import { getCounter } from './reducers/counter'

const mapStateToProps = (state) => ({
  todoCount: getTodoCount(state),  // instead of state.length
  todos: getTodos(state),  // instead of state
  counter: getCounter(state),  // instead of state
})
```
One problem with this method is that the value of state used by **mapStateToProps()** is the combined state of the rootReducer.

#### reducers/index.js
```javascript
import { combineReducers } from 'redux'
import todos from './todos'
import counter from './counter'

export default combineReducers({
  todos,
  counter
})
```
**mapStateToProps()** needs to be rewritten to pass the correct state slice into each selector.
```javascript
import { getTodos, getTodoCount } from './reducers/todos'
import { getCounter } from './reducers/counter'

const mapStateToProps = (state) => ({
  todoCount: getTodoCount(state.todos),
  todos: getTodos(state.todos),
  counter: getCounter(state.counter),
})
```
Meaning that the application needs to know about the store's structure, in order to pass the correct slice to the selectors. To avoid this problem it is generally recommended to perform this slice mapping in the root reducer.

#### reducers/index.js
```javascript
import { combineReducers } from 'redux'
import todos, { getTodos, getTodoCount, getFirstTodo, getTodo } from './todos'
import counter, { getCounter } from './counter'

export default combineReducers({
  todos,
  counter
})

export getTodos = (state) => getTodos(state.todos)
export getTodoCount = (state, index) => getTodoCount(state.todos)
export getFirstTodo = (state, index) => getFirstTodo(state.todos)
export getTodo = (state, index) => getTodo(state.todos, index)
export getCounter = (state) => getCounter(state.counter)
```
**mapStateToProps()** can now use selectors and not worry about which state slice to use.
```javascript
import { getTodos, getTodoCount } from './reducers/todos'
import { getCounter } from './reducers/counter'

const mapStateToProps = (state) => ({
  todoCount: getTodoCount(state),
  todos: getTodos(state),
  counter: getCounter(state),
})
```
However this comes at at cost of additional boilerplate in the root reducer. This package aims automatically map selectors when combining reducers. The individual reduce files do not need to be changed simply import the entire module for each reducer and pass this to the new **combineReducerMapSelectors()** method.

#### reducers/index.js
```javascript
import combineReducerMapSelectors from 'redux-reducer-selectors'
import * as todos from './todos'
import * as counter from './counter'

const { rootReducer, selectors } = combineReducerMapSelectors({
  todos,
  counter
})

export default rootReducer
export { selectors as Selectors }
```

```javascript
import { Selectors } from './reducers'

const mapStateToProps = (state) => ({
  todoCount: Selectors.getTodoCount(state),
  todos: Selectors.getTodos(state),
  counter: Selectors.getCounter(state),
})
```
