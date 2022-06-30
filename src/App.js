import React from 'react';
import styled from 'styled-components'

import GetLatestBlock from './GetLatestBlock'
import Authenticate from './Authenticate'
import SendTransaction from './SendTransaction'
import SdkExample from './SdkExample'

const Wrapper = styled.div`
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
`;

function App() {
  return (
    <Wrapper>
      <Authenticate />
      <SdkExample />
    </Wrapper>
  );
}

export default App;
