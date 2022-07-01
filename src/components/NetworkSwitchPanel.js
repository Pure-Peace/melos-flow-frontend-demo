import React, { useState } from "react";

import * as fcl from "@onflow/fcl";

import { Card, Select, Input, Button } from "./Common";

import { putTestnet, putMainnet } from "../utils";

export const NetworkSwitchPanel = ({ user, useNetwork }) => {
  const [network, setNetwork] = useNetwork();
  const [accessNodeInput, setAccessNodeInput] = useState("");
  const [accessNodeCustom, setAccessNodeCustom] = useState("");

  const configNetwork = (n) => {
    if (n === "Testnet") {
      if (network === "Mainnet") {
        if (user.loggedIn) {
          fcl.unauthenticate();
        }
      }
      putTestnet();
    } else if (n === "Mainnet") {
      if (network === "Testnet") {
        if (user.loggedIn) {
          fcl.unauthenticate();
        }
      }
      putMainnet();
    } else if (n === "Custom" && accessNodeCustom) {
      fcl.config().put("accessNode.api", accessNodeCustom);
    }

    if (n) {
      setNetwork(n);
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
