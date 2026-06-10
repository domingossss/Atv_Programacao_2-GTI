declare module 'react-helmet' {
  import { Component, ReactNode } from 'react';

  export interface HelmetProps {
    children?: ReactNode;
  }

  class Helmet extends Component<HelmetProps> {}
  export default Helmet;
}
