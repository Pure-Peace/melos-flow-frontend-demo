import React from "react";

import { Card, Button, Select } from "./Common";

export const SelectAuthPanel = ({ user, useAuth }) => {
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
