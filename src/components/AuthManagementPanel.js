import React, { useState } from "react";

import * as fcl from "@onflow/fcl";

import { Card, Input, Button } from "./Common";

import { createAuth } from "@melosstudio/flow-sdk/dist/index.js";

export const AuthManagementPanel = ({ useAuth }) => {
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
