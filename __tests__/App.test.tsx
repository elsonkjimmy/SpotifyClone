/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shiped with jest.
import {it, jest} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

jest.useFakeTimers();

it('renders correctly', async () => {
  let tree: renderer.ReactTestRenderer;

  await renderer.act(async () => {
    tree = renderer.create(<App />);
  });

  await renderer.act(async () => {
    jest.runOnlyPendingTimers();
  });

  tree!.unmount();
});
