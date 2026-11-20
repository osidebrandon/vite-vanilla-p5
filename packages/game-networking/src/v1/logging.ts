import { networkInterfaces } from "os";

export const logServerStartup = (port: number) => {
  const localIp = Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .find((address) => address.family === "IPv4" && !address.internal)?.address;

  console.log(`✔️  Server running at`);
  console.log(`\t✔️  localhost:${port}`);
  console.log(`\t✔️  ${localIp}:${port}`);
};

export const logServerShutdown = () => {
  console.log(`✔️  Server shutdown`);
};
