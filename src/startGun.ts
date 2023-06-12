import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import path from "path";

console.log(path.resolve(__dirname, "../node_modules/gun/gun.js"));

export default async function startGun() {
  const server = new Hapi.Server({
    port: 8765,
    host: "localhost",
    routes: {
      files: {
        relativeTo: "../node_modules/gun/",
      },
    },
  });

  await server.register(Inert);

  server.route({
    method: "GET",
    path: "/gun.js",
    handler: {
      file: path.resolve(__dirname, "../node_modules/gun/gun.js"),
    },
  });

  server.route({
    method: "GET",
    path: "/gun/nts.js",
    handler: {
      file: "../node_modules/gun/nts.js",
    },
  });

  server.route({
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: "../node_modules/gun/",
        redirectToSlash: true,
        index: true,
      },
    },
  });

  await server.start();
  console.log("Server running at:", server.info.uri);
}

startGun();
