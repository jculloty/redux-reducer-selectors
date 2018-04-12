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
