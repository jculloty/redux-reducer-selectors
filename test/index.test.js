import { createSelector } from 'reselect';
import combineReducerMapSelectors from '../src/index';

describe('Combine Reducer, Map Selectors', () => {
  it('Combines reducers', () => {
    const mapA = {
      default: (state = { a: 'A' }) => state,
      getA: (state) => state.a,
    };
    const mapB = {
      default: (state = { b: 'B' }) => state,
      getB: (state) => state.b,
    };
    const expectedState = { stateA: { a: 'A' }, stateB: { b: 'B' } };

    const { rootReducer } = combineReducerMapSelectors({
      stateA: mapA,
      stateB: mapB,
    });

    const state = rootReducer();

    expect(state).toEqual(expectedState);
  });

  it('Maps selector functions', () => {
    const mapA = {
      default: (state = { a: 'A' }) => state,
      getA: (state) => state.a,
    };
    const mapB = {
      default: (state = { b: 'B' }) => state,
      getB: (state) => state.b,
    };

    const { rootReducer, selectors } = combineReducerMapSelectors({
      stateA: mapA,
      stateB: mapB,
    });

    const state = rootReducer();

    expect(typeof selectors.getA).toBe('function');
    expect(typeof selectors.getB).toBe('function');

    expect(selectors.getA(state)).toBe('A');
    expect(selectors.getB(state)).toBe('B');
  });

  it('Handles selector parameters', () => {
    const map = {
      default: (state = { a: 'A', b: 'B' }) => state,
      getProp: (state, prop) => state[prop],
    };

    const { rootReducer, selectors } = combineReducerMapSelectors({
      map,
    });

    const state = rootReducer();

    expect(typeof selectors.getProp).toBe('function');

    expect(selectors.getProp(state, 'a')).toBe('A');
    expect(selectors.getProp(state, 'b')).toBe('B');
  });

  it('Only named functional exports are included in the Selectors object', () => {
    const initialState = { a: 1, b: 2 };
    const map = {
      initialState,
      default: (state = initialState) => state,
      getA: (state) => state.a,
      getB: (state) => state.b,
    };

    const { selectors } = combineReducerMapSelectors({
      map,
    });

    expect(Object.keys(selectors).length).toBe(2);
  });

  it('Works with reselect', () => {
    let innerCalls = 0;
    const map = {
      default: (state = { a: 1, b: 2 }, action) => {
        switch (action) {
          case 'incA':
            return { ...state, a: state.a + 1 };
          case 'incB':
            return { ...state, b: state.b + 1 };
        }
        return state;
      },
      getTotal: createSelector(
        [
          (state) => state.a,
          (state) => state.b,
        ],
        (a, b) => {
          innerCalls++;
          return a + b;
        }
      ),
    };

    const { rootReducer, selectors } = combineReducerMapSelectors({
      map,
    });

    let state = rootReducer();

    expect(typeof selectors.getTotal).toBe('function');

    expect(selectors.getTotal(state)).toBe(3);
    expect(selectors.getTotal(state)).toBe(3);
    expect(innerCalls).toBe(1);

    state = rootReducer(state, 'incA');
    expect(selectors.getTotal(state)).toBe(4);
    expect(selectors.getTotal(state)).toBe(4);
    expect(innerCalls).toBe(2);

    state = rootReducer(state, 'incB');
    expect(selectors.getTotal(state)).toBe(5);
    expect(selectors.getTotal(state)).toBe(5);
    expect(innerCalls).toBe(3);
  });

  it('Throws an error if the default reducer is missing', () => {
    const mapA = {
      getA: (state) => state.a,
    };
    const mapB = {
      default: (state = { b: 'B' }) => state,
      getB: (state) => state.b,
    };

    expect(() => {
      combineReducerMapSelectors({
        stateA: mapA,
        stateB: mapB,
      });
    }).toThrow(/must define a reducer/);
  });

  it('Throws an error if selectors share the same name', () => {
    const mapA = {
      default: (state = { a: 'A' }) => state,
      getValue: (state) => state.a,
    };
    const mapB = {
      default: (state = { b: 'B' }) => state,
      getValue: (state) => state.b,
    };

    expect(() => {
      combineReducerMapSelectors({
        stateA: mapA,
        stateB: mapB,
      });
    }).toThrow(/a selector of the same name is defined by another reducer/);
  });
});
