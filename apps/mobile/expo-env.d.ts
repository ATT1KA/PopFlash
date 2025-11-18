/// <reference types="expo-router" />
/// <reference types="react-native-vector-icons" />

declare module '*.svg' {
  import type { FunctionComponent } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const content: FunctionComponent<SvgProps>;
  export default content;
}