import { TIME } from "@/constants";

export const wrapPromiseWithTimeout = async (fn: () => Promise<any>) => {
  return new Promise(async (resolve, reject) => {
    const time = setTimeout(() => {
      reject({
        txHash: `0x0`,
        failed: true,
        details: "Timeout",
        shortMessage: "Timeout",
      });
    }, TIME.MINUTES["1"]);
    try {
      const resp = await fn();
      clearTimeout(time);
      resolve(resp);
    } catch (error) {
      clearTimeout(time);
      reject(error);
    }
  });
};
