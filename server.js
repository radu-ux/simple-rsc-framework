import React from "react";
import express from "express";
import esbuild from "esbuild";
import HMR from "./scripts/hmr.js";
import * as ReactServerDom from "react-server-dom-webpack/server.browser";
import * as babel from "@babel/core";
import tailwindcssPlugin from "esbuild-plugin-tailwindcss";
import { Readable } from "stream";
import { parse } from "es-module-lexer";
import { resolve, relative, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { readdir, readFile } from "fs/promises";

const hmr = new HMR();
const PORT = 4001;
const CLIENT_COMPONENT_MAP = {};
const APP_DIR = new URL("./app/", import.meta.url);
const FRAMEWORK_DIR = new URL("./framework/", import.meta.url);
const BUILD_DIR = new URL("./build/", import.meta.url);

/**
 * Utils
 */
// Returns a path relative to the build folder
function resolveBuild(path = "") {
  return resolve(fileURLToPath(new URL(path, BUILD_DIR)));
}
// Returns a path relative to the app folder
function resolveApp(path = "") {
  return resolve(fileURLToPath(new URL(path, APP_DIR)));
}
function resolveFramework(path = "") {
  return resolve(fileURLToPath(new URL(path, FRAMEWORK_DIR)));
}

async function build() {
  const buildClient = async (clientScripts) => {
    const clientBuildContext = await esbuild.context({
      entryPoints: [
        resolveApp("client.entry.jsx"),
        resolveFramework("router.client.jsx"),
        ...clientScripts,
      ],
      outdir: resolveBuild("client"),
      entryNames: "[name]",
      format: "esm",
      jsx: "automatic",
      bundle: true,
      splitting: true,
      plugins: [
        tailwindcssPlugin(),
        {
          name: "client-components-transformer",
          setup(build) {
            build.onResolve({ filter: /\.jsx$/ }, ({ path }) => {
              if (path.startsWith("@framework")) {
                if (path.includes("client")) {
                  return {
                    path: "./router.client.js",
                    external: true,
                  };
                }
              }

              return null;
            });
            build.onLoad(
              { filter: /\.jsx$/ },
              async ({ path: relativePath }) => {
                const path = resolveApp(relativePath);
                const processedCSSFiles = [];
                let code = await readFile(path, "utf-8");
                const parsableCode = (
                  await babel.transformAsync(code, {
                    presets: ["@babel/preset-react"],
                  })
                ).code;
                let newCode = code;

                const [imports, exports] = parse(parsableCode);

                for (const imp of imports) {
                  if (
                    imp.n &&
                    imp.n.endsWith(".css") &&
                    !processedCSSFiles.includes(relativePath)
                  ) {
                    newCode += `\n(() => {
                  if (typeof document !== 'undefined') {
                    const link = document.createElement('link');
                    const path = '${path}'
                    const pathSegments = path.split('/')
                    const jsFileName = pathSegments[pathSegments.length-1]
                    const cssFileName = jsFileName.replace('.jsx', '.css')
                    let linkSrc = '/client/' + cssFileName
                    linkSrc = linkSrc.replace(jsFileName, cssFileName)
                    link.setAttribute('rel', 'stylesheet')
                    link.setAttribute('href', linkSrc)
                    document.head.appendChild(link);
                  }
                  })();`;
                    processedCSSFiles.push(relativePath);
                  }
                }

                try {
                  if (code.startsWith('"use client"')) {
                    for (const exp of exports) {
                      const key = `${relativePath}-${exp.n}`;

                      CLIENT_COMPONENT_MAP[key] = {
                        // Have the browser import your component from your server
                        // at `/build/[component].js`
                        id: `/client/${basename(path).replace(".jsx", ".js")}`,
                        // Use the detected export name
                        name: exp.n,
                        // Turn off chunks. This is webpack-specific
                        chunks: [],
                        // Use an async import for the built resource in the browser
                        async: true,
                      };
                      newCode += `\n${exp.ln}.$$id = ${JSON.stringify(key)};\n${
                        exp.ln
                      }.$$typeof = Symbol.for("react.client.reference")`;
                    }

                    return { contents: newCode, loader: "jsx" };
                  }
                } catch (e) {
                  console.log(e);
                  return null;
                }

                return { contents: newCode, loader: "jsx" };
              }
            );
            build.onEnd(() => {
              hmr.reloadClients();
            });
          },
        },
      ],
    });

    clientBuildContext.watch();
  };

  const buildServer = async () => {
    const clientScripts = new Set();
    const serverBuildContext = await esbuild.context({
      entryPoints: [
        resolveApp("server.entry.jsx"),
        resolveFramework("router.server.jsx"),
      ],
      entryNames: "[name]",
      outdir: resolveBuild("server"),
      packages: "external",
      bundle: true,
      format: "esm",
      jsx: "automatic",
      plugins: [
        {
          name: "server-bundle-resolver",
          setup(build) {
            build.onResolve(
              { filter: /\.jsx$/ },
              async ({ path: relativePath, importer }) => {
                const path = importer
                  ? resolve(dirname(importer), relativePath)
                  : resolveApp(relativePath);

                if (relativePath.startsWith("@framework")) {
                  if (relativePath.includes("server")) {
                    return {
                      path: "./router.server.js",
                      external: true,
                    };
                  }
                }

                if (relativePath.endsWith(".jsx")) {
                  const code = await readFile(path, "utf-8");

                  if (code && code.startsWith('"use client"')) {
                    clientScripts.add(path);

                    return {
                      path: relative(
                        resolveBuild("server"),
                        resolveBuild(`client/${basename(path)}`)
                      ).replace(".jsx", ".js"),
                      external: true,
                    };
                  }
                }

                return null;
              }
            );
            build.onEnd(() => {
              hmr.reloadClients();
              buildClient(clientScripts);
            });
          },
        },
      ],
    });

    await serverBuildContext.watch();
  };

  await buildServer();
}

async function buildAPIEndpoints(server) {
  const apiFiles = await readdir(resolveApp("api"));
  const buildContext = await esbuild.context({
    entryPoints: apiFiles.map((filename) => resolveApp(`api/${filename}`)),
    outdir: resolveBuild("api"),
    packages: "external",
    format: "esm",
    bundle: true,
    metafile: true,
    plugins: [
      {
        name: "build-api-endpoints",
        setup(build) {
          build.onEnd(async (result) => {
            const builtArtifacts = Object.keys(result.metafile.outputs);
            for (const artifact of builtArtifacts) {
              const { exports } = result.metafile.outputs[artifact];
              const buildPath = resolve(artifact);
              const module = await import(buildPath);
              for (const method of exports) {
                if (
                  !["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)
                ) {
                  throw new Error(`${method} is not a valid HTTP verb`);
                }

                const routeHandler = module[method];
                if (routeHandler) {
                  const apiRoutePath = basename(buildPath).replace(".js", "");
                  server[method.toLocaleLowerCase()](
                    `/api/${apiRoutePath}`,
                    routeHandler
                  );
                }
              }
            }
          });
        },
      },
    ],
  });

  await buildContext.watch();

  return server;
}

async function createServer() {
  const app = express();

  app.use(express.json());
  app.use(express.static(resolveBuild()));

  await buildAPIEndpoints(app);

  app.get("/rsc", async (req, res) => {
    // Dynamically import the module to ensure it's the latest version
    const modulePath = `${resolveBuild(
      "server/server.entry.js"
    )}?${Date.now()}`;

    const Page = await import(modulePath);
    const Comp = React.createElement(Page.default, {
      request: req,
    });

    // stream is a Web Stream
    const stream = ReactServerDom.renderToReadableStream(
      Comp,
      CLIENT_COMPONENT_MAP
    );

    // Wait for the stream to be ready before piping
    await stream.allReady;

    // Convert Web Streams API ReadableStream to Node.js Readable stream
    const nodeReadableStream = Readable.fromWeb(stream);

    // Set the appropriate headers
    res.setHeader("Content-Type", "text/x-component");

    // Pipe the Node.js stream to the response
    nodeReadableStream.pipe(res);
  });

  app.get("*", async (req, res) => {
    const template = `
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/client/client.entry.js"></script>
          <script>
            ${hmr.getClientScript()}
          </script>
        </body>
      </html>
    `;
    res.set("Content-Type", "text/html").end(template);
  });

  return app;
}

async function boot() {
  const server = await createServer();
  await build();

  server.listen(PORT, () => {
    hmr.onConnection(() => {
      console.log("client connected");
    });
    console.log(`App running at: http://localhost:${PORT}`);
  });
}

boot();
