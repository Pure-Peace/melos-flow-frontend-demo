import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

import { createAuth } from "@melosstudio/flow-sdk/dist/index.js";

import { Card, Button, Input, Select, Option } from "./Components";

const putTestnet = () =>
  fcl
    .config()
    .put("accessNode.api", "https://access-testnet.onflow.org")
    .put("challenge.handshake", "https://flow-wallet-testnet.blocto.app/authn");

const putMainnet = () =>
  fcl
    .config()
    .put("accessNode.api", "https://flow-access-mainnet.portto.io")
    .put("challenge.handshake", "https://flow-wallet.blocto.app/authn");

putTestnet();

const BloctoUserPanel = ({ useNetwork, user }) => {
  const [network] = useNetwork();
  const signInOrOut = async (event) => {
    event.preventDefault();

    if (user.loggedIn) {
      fcl.unauthenticate();
    } else {
      fcl.authenticate();
    }
  };

  const userCard = (
    <div style={{ fontSize: "16px", padding: "20px 5px" }}>
      <div>Address: {user.addr}</div>
      <div>Email: {user.email}</div>
    </div>
  );

  return (
    <Card style={{ padding: "20px", width: "350px" }}>
      <div style={{ height: "150px", color: "#14428A" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>
          {network != "Custom" && user.addr ? "LoggedIn" : "Not login"}
        </div>
        {network != "Custom" && user.addr && userCard}
        <div style={{ padding: "20px 20px 0 20px" }}>
          <Button onClick={signInOrOut} disabled={network === "Custom"}>
            {network === "Custom"
              ? "Not support custom network"
              : user.loggedIn
              ? `Sign Out`
              : "Sign In/Up"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const NetworkSwitchPanel = ({ useNetwork }) => {
  const [network, setNetwork] = useNetwork();
  const [accessNodeInput, setAccessNodeInput] = useState("");
  const [accessNodeCustom, setAccessNodeCustom] = useState("");

  const configNetwork = (network) => {
    if (network === "Testnet") {
      putTestnet();
    } else if (network === "Mainnet") {
      putMainnet();
    } else if (network === "Custom" && accessNodeCustom) {
      fcl.config().put("accessNode.api", accessNodeCustom);
    }

    if (network) {
      setNetwork(network);
    }
  };
  return (
    <Card style={{ padding: "20px", width: "350px" }}>
      <div style={{ height: "150px", color: "#14428A" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>
          Switch Network ({network})
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "20px 20px 0 20px",
          }}
        >
          <Select
            value={network}
            onChange={(ev) => {
              ev.persist();
              const v = ev.target.value;
              configNetwork(v);
            }}
          >
            <option value="Testnet">Testnet</option>
            <option value="Mainnet">Mainnet</option>
            <option value="Custom">
              Custom {accessNodeCustom ? `(${accessNodeCustom})` : ""}
            </option>
          </Select>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "10px",
            }}
          >
            <Input
              disabled={network !== "Custom"}
              placeholder="accessNode url"
              value={accessNodeInput}
              onChange={(ev) => setAccessNodeInput(ev.target.value)}
            ></Input>
            <Button
              disabled={network !== "Custom"}
              style={{ marginTop: "10px" }}
              onClick={(ev) => {
                setAccessNodeCustom(accessNodeInput);
                fcl.config().put("accessNode.api", accessNodeInput);
              }}
            >
              Use custom network
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const AddAuthPanel = ({ useAuth }) => {
  const [auth, setAuth] = useAuth();
  const [authInput, setAuthInput] = useState("");
  const [err, setErr] = useState("");
  const handleAddAuth = (event) => {
    if (!authInput) {
      setErr("Please input auth string");
      return;
    }
    const parsed = authInput.trim().split(":");
    if (parsed.length < 4) {
      setErr("Invalid auth string");
      return;
    }
    const [name, address, privateKey, keyIdStr] = parsed;
    if (address.length > privateKey.length) {
      setErr("Please check address and privateKey");
      return;
    }
    const keyId = Number(keyIdStr);
    if (keyId === NaN) {
      setErr("Invalid keyId Number");
      return;
    }
    try {
      const au = createAuth(fcl, address, privateKey, keyId);
      const a = { name, address, keyId, auth: au };
      setAuth({
        current: auth.current?.name ? auth.current : a,
        map: { ...auth.map, [name]: a },
      });
      setAuthInput("");
      setErr("");
    } catch (e) {
      setErr(e.toString());
      return;
    }
  };
  return (
    <Card style={{ padding: "20px", width: "500px" }}>
      <div style={{ color: "#14428A" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>Add auth</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "20px 20px 0 20px",
        }}
      >
        <Input
          value={authInput}
          placeholder="<AccountName>:<FlowAddress>:<PrivateKey>:<KeyId>"
          onChange={(ev) => setAuthInput(ev.target.value)}
        />
        <div
          style={{
            color: "red",
            height: "20px",
            marginTop: "5px",
          }}
        >
          {err}
        </div>
        <Button style={{ marginTop: "5px" }} onClick={handleAddAuth}>
          Add auth
        </Button>
      </div>
    </Card>
  );
};

const SelectAuthPanel = ({ user, useAuth }) => {
  const [auth, setAuth] = useAuth();
  const base = user?.addr
    ? [
        <option key={user.email} value="!@#blocto!@#">
          {user.email}
        </option>,
      ]
    : [];

  const opts = [
    ...base,
    ...Object.keys(auth.map).map((i) => (
      <option key={i} value={i}>
        {i}
      </option>
    )),
  ];
  return (
    <Card style={{ padding: "20px", width: "500px" }}>
      <div style={{ color: "#14428A" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>
          Select auth ({opts.length})
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "20px 20px 0 20px",
        }}
      >
        <Select
          value={auth.current?.name || (user?.addr ? user.addr : "")}
          onChange={(ev) => {
            ev.persist();
            const v = ev.target.value;
            setAuth({
              current: v === "!@#blocto!@#" ? {} : auth.map[v],
              map: auth.map,
            });
          }}
        >
          {opts.length > 0
            ? opts
            : [<option key="none">Please add auth</option>]}
        </Select>

        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginTop: "20px",
            color: "#14428A",
          }}
        >
          Current auth:{" "}
          {auth.current?.name
            ? `${auth.current?.name} (${auth.current?.address}.${auth.current?.keyId})`
            : user.addr
            ? `${user.email || user.addr}`
            : "-"}
        </div>
        <Button
          style={{ marginTop: "10px" }}
          disabled={!auth.current?.name || auth.current?.isBlocto}
          onClick={() => {
            const { [auth.current?.name]: removed, ...rest } = auth.map;
            setAuth({
              current: Object.values(rest)[0] || {},
              map: rest,
            });
          }}
        >
          Remove current
        </Button>
      </div>
    </Card>
  );
};

const CurrentUser = ({ useAuth }) => {
  const [auth, setAuth] = useAuth();
  const [user, setUser] = useState({});

  const [network, setNetwork] = useState("Testnet");
  const useNetwork = () => [network, setNetwork];

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
    <div style={{ display: "flex" }}>
      <BloctoUserPanel useNetwork={useNetwork} user={user} />
      <NetworkSwitchPanel useNetwork={useNetwork} />
      <AddAuthPanel useAuth={useAuth} />
      <SelectAuthPanel user={user} useAuth={useAuth} />
    </div>
  );
};

export default CurrentUser;
