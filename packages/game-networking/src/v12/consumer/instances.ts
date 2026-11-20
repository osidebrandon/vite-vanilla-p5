import { ReferenceTransportClient } from "../framework/client/application/ReferenceTransportClient";
import { ReferenceTransportServer } from "../framework/server/application/ReferenceTransportServer";

export type MyCommands = {
  message: { text: string };
  roundTrip: { a: "a" };
};

export type MyEvents = {
  message: { text: string; authId: string };
  roundTrip: { b: "b" };
};

// Instantiate both client and server.
// This is because we are running both on 'client'.
export const client = new ReferenceTransportClient<MyCommands, MyEvents>();
export const server = new ReferenceTransportServer<MyCommands, MyEvents>();

// Wire them together.
client.setReferenceTransportServer(server);
server.setReferenceTransportClient(client);
