import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as fcl from "@onflow/fcl";

const Card = styled.div`
  margin: 10px 5px;
  padding: 10px;
  border: 1px solid #c0c0c0;
  border-radius: 5px;
`;

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
    <div style={{ height: "150px" }}>
      <div style={{ fontSize: "18px", fontWeight: "bold" }}>
        {user.addr ? "LoggedIn" : "Not login"}
      </div>
      {user.addr && userCard}
      <div>
        <button
          onClick={signInOrOut}
          style={{
            display: "block",
            margin: "10px 10px",
            padding: "10px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {user.loggedIn ? `Sign Out` : "Sign In/Up"}
        </button>
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
    <Card style={{ padding: "20px" }}>
      <SignInOutButton user={user} />
    </Card>
  );
};

export default CurrentUser;
