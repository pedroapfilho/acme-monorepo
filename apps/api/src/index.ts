import { createServer } from "@/server";

const start = async () => {
  try {
    const app = await createServer();

    app.listen(
      { port: app.config.HTTP_PORT, host: app.config.HTTP_HOST },
      (error, address) => {
        if (error) {
          app.log.error(error);
          process.exit(1);
        }

        app.log.info(`Server listening on ${address}`);
      }
    );
  } catch (e) {
    console.error(e);
  }
};

start();
