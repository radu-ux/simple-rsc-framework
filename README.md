# simple-react-framework

A simple framework for working with server components in react. It tries to mimic the behaviour of react-router-dom, but on the server. So, the heavy routing logic happens on the server (see: **framework/router.server.jsx**). On the client, the router is responsible just for requesting the new server component tree and rendering it. (see: **framework/router.server.jsx**).

The application routes are defined inside **app/server.entry.jsx**. This is the componet used to determine for which route we should build the rsc payload. The **app/client.entry.jsx** gets the inital rsc payload and hands off the _control_ to the client router.

### Getting starded

To get sarted run:
`npm i --force`
**Note: --force option is used becase server components are not standardized in React. so we are using an experimental version of it**
