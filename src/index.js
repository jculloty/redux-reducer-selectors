import { combineReducers } from 'redux';
import warning from './warning';

/**
 * Prints a warning in the console if it exists.
 *
 * @param {Object} reducerSelectors A map of reducerSelectors
 *          Each proprty is in the form stateSegmentName: module export
 *          Wher module export is in the form import * as x from './x';
 * @throws throws an error if any of the reducers do not export a default function (assumnet to be the reducer)
 * @throws throws an error if any selectors share the same name
 * @returns {Object} { rootReducer, selectors }
 *          The rootReducer created by calling combineReducers() on the supplied reducers
 *          selectors each selector mapped using the correct state segment
 */
export default function combineReducerMapSelectors(reducerSelectors) {
  const reducers = {};
  const selectors = {};

  Object.keys(reducerSelectors).forEach((stateSegmentName) => {
    // Map all default exports to a reducers object
    if (!reducerSelectors[stateSegmentName].default || typeof reducerSelectors[stateSegmentName].default !== 'function') {
      warning(`state ${stateSegmentName} must define a reducer as it's default export`);
    }
    reducers[stateSegmentName] = reducerSelectors[stateSegmentName].default;

    // Map all other exported functions to a selectors object
    Object.keys(reducerSelectors[stateSegmentName]).forEach((selector) => {
      if (selector !== 'default' && typeof reducerSelectors[stateSegmentName][selector] === 'function') {
        // Another reducer defined a selector of the same name
        if (selectors[selector]) {
          warning(`Failed to add ${stateSegmentName}.${selector}() selector, a selector of the same name is defined by another reducer.`);
        }
        // Map the selector to use the correct stage stateSegmentName
        // e.g. getName = (state) => getName(state.user)
        selectors[selector] = (globalState, ...params) => reducerSelectors[stateSegmentName][selector](globalState[stateSegmentName], ...params);
      }
    });
  });

  const rootReducer = combineReducers(reducers);
  return { rootReducer, selectors };
}
