import React from "react";

import { Card, Code } from "./Common";

export const Console = ({ useConsole }) => {
  const { status, log } = useConsole();
  return (
    <Card style={{ display: "flex", flexDirection: "column", flex: "1" }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#14428A" }}>
        Console
      </div>
      <Code>{status}</Code>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#14428A" }}>
        Results
      </div>

      <Code
        style={{
          maxHeight: "100%",
          height: "calc(100% - 120px)",
        }}
      >
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {log ? log : "None"}
        </div>
      </Code>
    </Card>
  );
};
