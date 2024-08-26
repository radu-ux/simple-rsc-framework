"use client";

import React from "react";
import { createFromFetch } from "react-server-dom-webpack/client";

const RouterContext = React.createContext();

export function useRouter() {
  const ctx = React.useContext(RouterContext);

  if (!ctx) {
    throw new Error("useRouter() should be used inside <RSCRouter />");
  }

  return ctx;
}

export function useIsNavigating() {
  const { isNavigating } = useRouter();

  return isNavigating;
}

export function useNavigate() {
  const router = useRouter();

  return router.navigate;
}

export function Link({ to, children, ...rest }) {
  const navigate = useNavigate();

  const onNavigation = (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={onNavigation} {...rest}>
      {children}
    </a>
  );
}

export function Router({ initialServerTree }) {
  const [isNavigating, startTransition] = React.useTransition();
  const [serverTree, setServerTree] = React.useState(initialServerTree);

  const navigate = React.useCallback((to) => {
    startTransition(() => {
      const url = new URL(to, import.meta.url);

      createFromFetch(
        fetch(`/rsc?pathname=${url.pathname}&${url.search.replace("?", "")}`)
      ).then((newServerTree) => {
        startTransition(() => {
          setServerTree(newServerTree);
          window.history.pushState(null, "", to);
        });
      });
    });
  }, []);

  React.useEffect(() => {
    const onHistoryPopState = (e) => {
      navigate(e.currentTarget.location.pathname);
    };

    window.addEventListener("popstate", onHistoryPopState);

    return () => {
      window.removeEventListener("popstate", onHistoryPopState);
    };
  }, []);

  return (
    <RouterContext.Provider value={{ navigate, isNavigating }}>
      {serverTree}
    </RouterContext.Provider>
  );
}
