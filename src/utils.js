import * as fcl from "@onflow/fcl";

export const putTestnet = () =>
  fcl
    .config()
    .put("accessNode.api", "https://access-testnet.onflow.org")
    .put("challenge.handshake", "https://flow-wallet-testnet.blocto.app/authn");

export const putMainnet = () =>
  fcl
    .config()
    .put("accessNode.api", "https://flow-access-mainnet.portto.io")
    .put("challenge.handshake", "https://flow-wallet.blocto.app/authn");

export const getSdkMethodList = (sdk) => {
  const proto = Object.getPrototypeOf(sdk);
  return Object.getOwnPropertyNames(proto).filter(
    (i) => typeof proto[i] === "function" && i !== "constructor"
  );
};

export const getSdkFuncParams = (func) => {
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

export const buildSdk = (sdk) =>
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
