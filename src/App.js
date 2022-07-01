import React, { useState, useEffect } from "react";
import styled from "styled-components";

import * as fcl from "@onflow/fcl";

import { BloctoPanel } from "./components/BloctoPanel";
import { NetworkSwitchPanel } from "./components/NetworkSwitchPanel";
import { AuthManagementPanel } from "./components/AuthManagementPanel";
import { SelectAuthPanel } from "./components/SelectAuthPanel";
import { SdkPanels } from "./components/SdkPanels";
import { Console } from "./components/Console";

import { putTestnet, putMainnet } from "./utils";

const DEFAULT_NETWORK = "Testnet";
DEFAULT_NETWORK === "Testnet" ? putTestnet() : putMainnet();

const Main = styled.div`
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
`;

function App() {
  const [auth, setAuth] = useState({ current: {}, map: {} });
  const useAuth = () => [auth, setAuth];

  const [network, setNetwork] = useState(DEFAULT_NETWORK);
  const useNetwork = () => [network, setNetwork];

  const [user, setUser] = useState({});
  const useUser = () => [user, setUser];

  const [status, setStatus] = useState("No status");
  const [log, setLog] = useState(null);
  const useConsole = () => {
    return { status, setStatus, log, setLog };
  };

  useEffect(
    () =>
      fcl.currentUser().subscribe((user) =>
        setUser({
          ...user,
          email: user?.services?.find((i) => i.scoped?.email)?.scoped?.email,
        })
      ),
    []
  );

  return (
    <Main>
      <div style={{ display: "flex" }}>
        <BloctoPanel network={network} user={user} useUser={useUser} />
        <NetworkSwitchPanel useNetwork={useNetwork} user={user} />
        <AuthManagementPanel useAuth={useAuth} />
        <SelectAuthPanel user={user} useAuth={useAuth} />
      </div>
      <div>
        <div style={{ display: "flex", height: "700px" }}>
          <SdkPanels auth={auth} useConsole={useConsole} user={user} />
          <Console useConsole={useConsole} />
        </div>
      </div>
    </Main>
  );
}

export default App;
