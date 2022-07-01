import React from "react";

import * as fcl from "@onflow/fcl";

import { Card, Button } from "./Common";

export const BloctoPanel = ({ network, user }) => {
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
          {network !== "Custom" && user.addr ? "LoggedIn" : "Not login"}
        </div>
        {network !== "Custom" && user.addr && userCard}
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
