import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Code, Card, Button, Input, Panel } from "./Components";

const {
  MelosMarketplaceSDK,
  MelosNFTSDK,
  TESTNET_BASE_ADDRESS_MAP,
  flowTokenReplaceMap,
  melosNftReplaceMap,
  ListingType,
  getTemplateInfo,
  sdkCode,
  toUFix64,
  CommonSDK,
} = require("@melosstudio/flow-sdk/dist/index.js");

const MELOS_NFT_ADDRESS = "0xd9a922f2f589c50c";
const MELOS_MARKETPLACE = "0xd9a922f2f589c50c";

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

const getSdkMethodList = (sdk) => {
  const proto = Object.getPrototypeOf(sdk);
  return Object.getOwnPropertyNames(proto).filter(
    (i) => typeof proto[i] === "function" && i !== "constructor"
  );
};

const getSdkFuncParams = (func) => {
  const params = func
    .toString()
    .match(/.*?\(([^)]*)\)/)[1]
    .replace(/ /g, "")
    .split(",");
  return {
    type: params.includes("auth") ? "transaction" : "script",
    params: params.filter((p) => !["auth", "options"].includes(p)),
  };
};

const buildSdk = (sdk) =>
  getSdkMethodList(sdk).reduce(
    (acc, cur) => {
      const params = getSdkFuncParams(sdk[cur]);
      const typed =
        params.type === "transaction" ? acc.transactions : acc.scripts;
      typed[cur] = {
        func: sdk[cur].bind(sdk),
        ...params,
      };
      return acc;
    },
    { sdk, transactions: {}, scripts: {} }
  );

const melosMarketplaceSDKBuilded = buildSdk(melosMarketplaceSDK);
const melosNftSDKBuilded = buildSdk(melosNftSDK);
const commonSDKBuilded = buildSdk(commonSDK);

const SdkExample = () => {
  const [user, setUser] = useState({});
  const [sdkFuncParams, setSdkFuncParams] = useState({});

  useEffect(
    () => fcl.currentUser().subscribe((user) => setUser({ ...user })),
    []
  );
  const [status, setStatus] = useState("No status");
  const [log, setLog] = useState(null);

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
        }
        acc.push(param);
        return acc;
      },
      execType === "transactions" ? [fcl.authz] : []
    );
    console.log("params: ", params, "schemas: ", schemas);
    setStatus(`Executing ${execType} "${name}"...`);
    setLog(<div>{`Executing ${execType} "${name}"...`}</div>);

    try {
      const result =
        execType === "scripts"
          ? (await method.func(...params)).unwrap()
          : await (await method.func(...params)).assertOk("seal");
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
    } catch (_) {
      console.error(_);
    }
    return (
      <Panel key={`${type}-${sdkName}-${name}`}>
        <Button
          onClick={async (event) => {
            await execWrapper(event, type, sdkName, name, method, schemas);
          }}
          disabled={type === "transactions" && !isLogged()}
        >
          {name}
        </Button>

        {method.params.map((param) => {
          const funcKey = `${sdkName}.${name}.${param}`;
          return (
            <div key={funcKey} style={{ padding: "5px" }}>
              <Input
                disabled={type === "transactions" && !isLogged()}
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
      <Card style={{ overflow: "auto", position: "relative", width: "700px" }}>
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

  const isLogged = () => !!user?.addr;

  return (
    <div>
      <div style={{ display: "flex", height: "700px" }}>
        {createSdkFunctionsCard(
          "MelosMarketplaceSDK",
          melosMarketplaceSDKBuilded
        )}
        {createSdkFunctionsCard("MelosNftSDK", melosNftSDKBuilded)}
        {createSdkFunctionsCard("CommonSDK", commonSDKBuilded)}
        <Card style={{ width: "calc(100% - 300px)" }}>
          <div
            style={{ fontSize: "18px", fontWeight: "bold", color: "#14428A" }}
          >
            Console
          </div>
          <Code>{status}</Code>
          <div
            style={{ fontSize: "18px", fontWeight: "bold", color: "#14428A" }}
          >
            Results
          </div>

          <Code
            style={{
              maxHeight: "100%",
              height: "calc(100% - 120px)",
              width: "100%",
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
      </div>
    </div>
  );
};

export default SdkExample;
