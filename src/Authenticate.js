import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

import { Card, Button } from "./Components";

const SignInOutButton = ({ user }) => {
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
    <div style={{ height: "150px", color: "#14428A" }}>
      <div style={{ fontSize: "16px", fontWeight: "bold" }}>
        {user.addr ? "LoggedIn" : "Not login"}
      </div>
      {user.addr && userCard}
      <div>
        <Button onClick={signInOrOut}>
          {user.loggedIn ? `Sign Out` : "Sign In/Up"}
        </Button>
      </div>
    </div>
  );
};

const CurrentUser = () => {
  const [user, setUser] = useState({});

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
    <Card style={{ padding: "20px", width: "500px" }}>
      <SignInOutButton user={user} />
    </Card>
  );
};

export default CurrentUser;
