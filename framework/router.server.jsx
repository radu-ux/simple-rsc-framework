import React from "react";
import routeConstructor from "path-match";

function resolveRoutes(reactNode) {
  if (!!reactNode.props.children === false) {
    return {
      path: reactNode.props.path,
      element: reactNode.props.element,
      children: [],
    };
  }
  const childrenAsArray = React.Children.toArray(reactNode.props.children);

  if (childrenAsArray.length) {
    return {
      path: reactNode.props.path,
      element: reactNode.props.element,
      children: childrenAsArray.map((c) => resolveRoutes(c)),
    };
  }
}

function flattRoute(route) {
  if (route.children.length > 0) {
    return [
      route,
      route.children.reduce((acc, childRoute) => {
        acc = acc.concat(flattRoute(childRoute));

        return acc;
      }, []),
    ].flat(2);
  }

  return [route];
}

function resolveActiveRoutes(routes, pathname) {
  const route = routeConstructor({ strict: true });
  const activeRoutes = [];

  // Try to find an exact match
  const exactMatchRoute = routes.find((r) => {
    const match = route(r.path);
    return match(pathname);
  });

  if (exactMatchRoute && exactMatchRoute.path !== "*") {
    // If there is an exact match then make it active (it means there is a top-level route with this url)
    activeRoutes.push(exactMatchRoute);
  } else {
    // Start the matching algorithm
    const pathSegments = pathname.split("/").map((s) => `/${s}`);
    const flattenedRoutes = routes.flatMap(flattRoute);
    let segmentIndex = 0;

    while (segmentIndex < pathSegments.length) {
      // Try to match each segment of the url
      let segment = pathSegments
        .slice(0, segmentIndex + 1)
        .join("")
        .replace("//", "/");
      const routeMatch = flattenedRoutes.find((r) => {
        const match = route(r.path);
        return match(segment);
      });
      const routeAlreadyActivated =
        routeMatch && activeRoutes.find((r) => r?.path == routeMatch.path);

      if (!routeAlreadyActivated) {
        activeRoutes.push(routeMatch);
      }

      segmentIndex++;
    }
  }

  return activeRoutes.filter((r) => r !== undefined);
}

function isRouteActive(activeRoutes, path) {
  if (activeRoutes) {
    const starWilcardMatch = !!activeRoutes.find((r) => r?.path === "*");
    const match = !!activeRoutes.find((r) => r?.path === path);

    if (path !== "*" && starWilcardMatch) {
      return false;
    }

    if (path === "*" && starWilcardMatch) {
      return true;
    }

    return match;
  }
  return false;
}

let activeRoutes = [];
export let pathname = null;
export let activeParams = {};
export let activeSearch = {};
export function Router({ request, children }) {
  const { pathname: currentPathname, ...rest } = request.query;
  const childrenArray = React.Children.toArray(children);
  const routes = childrenArray.flatMap(resolveRoutes);
  const route = routeConstructor({ strict: true });

  pathname = currentPathname;
  activeSearch = rest;
  activeRoutes = resolveActiveRoutes(routes, pathname);
  activeParams = activeRoutes
    .map((r) => {
      const match = route(r.path);

      return match(pathname);
    })
    .filter((param) => !!param)
    .reduce((acc, param) => {
      const normalizedParams = Object.keys(param).reduce((kAcc, k) => {
        return {
          ...kAcc,
          [k]: param[k].replace(/\?.*$/, ""),
        };
      }, {});
      return {
        ...acc,
        ...normalizedParams,
      };
    }, {});

  return children;
}

export function Route({ path, element, fallback }) {
  const isActive = isRouteActive(activeRoutes, path);

  if (isActive) {
    return <React.Suspense fallback={fallback}>{element}</React.Suspense>;
  }

  return null;
}

export function Outlet({ path: parentPath }) {
  const nextPath = activeRoutes.findIndex((p) => p.path === parentPath);

  if (nextPath === -1) {
    return null;
  }

  const nextRoute = activeRoutes[nextPath + 1];

  if (!nextRoute) {
    return null;
  }

  return <Route path={nextRoute.path} element={nextRoute.element} />;
}
