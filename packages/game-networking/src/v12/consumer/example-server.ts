import { basicLifecycle } from "@lifecycles";
import { server } from "./shared/instances";

const offEvent = server.onEvent("message", (payload) => {
  console.log(JSON.stringify({ event, payload }));
});

const offError = server.onError((error) => {
  console.log(JSON.stringify(error));
});

basicLifecycle({
  onStart: async () => {
    await server.start();

    const result = await client.sendAndWait("roundTrip", "roundTrip", {
      a: "a",
    });

    console.log(JSON.stringify(result));

    client.send("message", { text: "Hello world!" });

    server.stop();
    offStatusChange();
    offEvent();
    offError();
  },
  onStop: () => {
    // Nothing?
  },
});
