import React, { useState } from "react";
import styled from "styled-components";

import GetLatestBlock from "./GetLatestBlock";
import Authenticate from "./Authenticate";
import SendTransaction from "./SendTransaction";
import SdkExample from "./SdkExample";

const Wrapper = styled.div`
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
`;

function App() {
  const [auth, setAuth] = useState({ current: {}, map: {} });
  const useAuth = () => [auth, setAuth];

  return (
    <Wrapper>
      <Authenticate useAuth={useAuth} />
      <SdkExample useAuth={useAuth} />
    </Wrapper>
  );
}

export default App;
