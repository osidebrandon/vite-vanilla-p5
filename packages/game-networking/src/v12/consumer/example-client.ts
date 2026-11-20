import { basicLifecycle } from "@lifecycles";
import { client } from "./instances";

const offStatusChange = client.onStatusChange((status) => {
  console.log(JSON.stringify(status));
});

const offEvent = client.onEvent("message", (payload) => {
  console.log(JSON.stringify({ payload }));
});

const offError = client.onError((error) => {
  console.log(JSON.stringify(error));
});

basicLifecycle({
  onStart: async () => {
    await client.connect();

    const result = await client.sendAndWait("roundTrip", "roundTrip", {
      a: "a",
    });

    console.log(JSON.stringify(result));

    client.send("message", { text: "Hello world!" });

    client.disconnect();
    offStatusChange();
    offEvent();
    offError();
  },
  onStop: () => {
    // Nothing?
  },
});
