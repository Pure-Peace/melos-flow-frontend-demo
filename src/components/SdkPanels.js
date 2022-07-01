import React, { useState } from "react";
import * as fcl from "@onflow/fcl";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { Card, Button, Input, Panel } from "./Common";

import { buildSdk } from "../utils";

const {
  MelosMarketplaceSDK,
  MelosNFTSDK,
  TESTNET_BASE_ADDRESS_MAP,
  flowTokenReplaceMap,
  melosNftReplaceMap,
  getTemplateInfo,
  sdkCode,
  toUFix64,
  CommonSDK,
} = require("@melosstudio/flow-sdk/dist/index.js");

const MELOS_NFT_ADDRESS = "0x7b6d4c3338e215c0";
const MELOS_MARKETPLACE = "0x7b6d4c3338e215c0";

const TESTNET_ADDRESS_MAP = {
  ...TESTNET_BASE_ADDRESS_MAP,
  MelosNFT: MELOS_NFT_ADDRESS,
  MelosMarketplace: MELOS_MARKETPLACE,
};

const TESTNET_REPLACE_MAP = {
  ...flowTokenReplaceMap("testnet"),
  ...melosNftReplaceMap(MELOS_NFT_ADDRESS),
};

const extraSchemas = {
  "MelosNftSDK.transfer.nftId": "UInt64",
};

const melosMarketplaceSDK = new MelosMarketplaceSDK(
  TESTNET_ADDRESS_MAP,
  TESTNET_REPLACE_MAP
);
const melosNftSDK = new MelosNFTSDK(TESTNET_ADDRESS_MAP, TESTNET_REPLACE_MAP);
const commonSDK = new CommonSDK(TESTNET_ADDRESS_MAP, TESTNET_REPLACE_MAP);

const buildedSdks = {
  MelosMarketplaceSDK: buildSdk(melosMarketplaceSDK),
  MelosNftSDK: buildSdk(melosNftSDK),
  CommonSDK: buildSdk(commonSDK),
};

export const SdkPanels = ({ auth, user, useConsole }) => {
  const { setStatus, setLog } = useConsole();

  const [sdkFuncParams, setSdkFuncParams] = useState({});

  const hasAuth = () => !!auth.current.auth || !!user?.addr;

  const execWrapper = async (
    event,
    execType,
    sdkName,
    name,
    method,
    schemas
  ) => {
    event.preventDefault();

    const params = method.params.reduce(
      (acc, p) => {
        let param = sdkFuncParams[[`${sdkName}.${name}.${p}`]];
        const type = schemas[p] || extraSchemas[`${sdkName}.${name}.${p}`];
        if (type) {
          if (/.*?\[([^)]*)\]/.test(type)) {
            try {
              param = JSON.parse(param);
            } catch (_) {
              param = [];
            }
          } else if (type.includes("Int")) {
            param = Number(param);
          } else if (type.includes("Fix")) {
            param = toUFix64(param);
          }
        } else {
          try {
            param = JSON.parse(param);
          } catch (_) {}
        }
        acc.push(param);
        return acc;
      },
      execType === "transactions" ? [auth.current.auth || fcl.authz] : []
    );
    console.log("params: ", params, "schemas: ", schemas);
    setStatus(`Executing ${execType} "${name}"...`);
    setLog(<div>{`Executing ${execType} "${name}"...`}</div>);

    try {
      let result;
      if (execType === "scripts") {
        result = (await method.func(...params)).unwrap();
      } else {
        const tx = (await method.func(...params)).unwrap();
        console.log("Transactions sended, id: ", tx.txId);
        setStatus(`Waiting for seal...`);
        setLog(
          <div>{`Transaction "${tx.txId}" sended, waiting for seal...`}</div>
        );
        result = await tx.seal();
      }

      console.log("sdk result: ", result);
      setLog(
        <SyntaxHighlighter language="json" style={docco}>
          {JSON.stringify(result, null, 2)}
        </SyntaxHighlighter>
      );
      setStatus(`${execType} "${name}" exec done`);
    } catch (error) {
      console.error(error);
      setLog(
        <div
          style={{ color: "red" }}
        >{`${execType} "${name}" execute failed with: ${error}`}</div>
      );
      setStatus(`${execType} "${name}" execute failed`);
    }
  };

  const funcComponent = (type, sdkName, name, method) => {
    let schemas = {};
    try {
      const contractName = (
        sdkName.at(0).toLowerCase() + sdkName.slice(1)
      ).replace("SDK", "");
      const code = sdkCode[type][contractName][name];
      if (code) {
        const templateInfo = getTemplateInfo(code);
        schemas = templateInfo.args.reduce((acc, cur) => {
          const [name, t] = cur.split(":");
          acc[name] = t;
          return acc;
        }, {});
      }
    } catch (_) {}
    return (
      <Panel key={`${type}-${sdkName}-${name}`}>
        <Button
          onClick={async (event) => {
            await execWrapper(event, type, sdkName, name, method, schemas);
          }}
          disabled={type === "transactions" && !hasAuth()}
        >
          {name}
        </Button>

        {method.params.map((param) => {
          const funcKey = `${sdkName}.${name}.${param}`;
          return (
            <div key={funcKey} style={{ padding: "5px" }}>
              <Input
                disabled={type === "transactions" && !hasAuth()}
                onChange={(ev) =>
                  setSdkFuncParams({
                    ...sdkFuncParams,
                    [funcKey]: ev.target.value,
                  })
                }
                placeholder={`${param}: ${
                  schemas[param] || extraSchemas[funcKey] || "any"
                }`}
              ></Input>
            </div>
          );
        })}
      </Panel>
    );
  };

  const createSdkFunctionsCard = (sdkName, buildedSdk) => {
    return (
      <Card
        key={sdkName}
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          position: "relative",
        }}
      >
        {["scripts", "transactions"].map((type) => (
          <Card key={`${type}`} style={{ padding: "5px", width: "300px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                padding: "16px",
                color: "#14428A",
              }}
            >
              {sdkName} {type} ({Object.keys(buildedSdk[type]).length})
            </div>
            {Object.entries(buildedSdk[type]).map(([k, v]) =>
              funcComponent(type, sdkName, k, v)
            )}
          </Card>
        ))}
      </Card>
    );
  };

  return (
    <>
      {Object.entries(buildedSdks).map(([k, v]) =>
        createSdkFunctionsCard(k, v)
      )}
    </>
  );
};
