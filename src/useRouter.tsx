import {
  ComponentType,
  HTMLAttributes,
  useEffect,
  useMemo,
  useReducer
} from "react";
import { match } from "path-to-regexp";

type Routes = Record<string, ComponentType<any>>;

export function matchRoute(routes: Routes) {
  let routeMatched = "";
  const [resultMatch] = Object.keys(routes)
    .map((route) => {
      const routeMatcher = match(route);
      const matched = routeMatcher(window.location.pathname);
      if (matched) routeMatched = route;
      return matched;
    })
    .filter(Boolean) as [any];

  return [
    routeMatched,
    (resultMatch || {}).params as Record<string, string | number>
  ] as const;
}

function useHistory() {
  const methods = useMemo(
    () => ({
      push: (path: string) => {
        if (window.location.pathname === path) return;
        window.history.pushState(null, "path", path);
        window.dispatchEvent(new Event("popstate"));
      },
      replace: (path: string) => {
        if (window.location.pathname === path) return;
        window.history.replaceState(null, "path", path);
        window.dispatchEvent(new Event("popstate"));
      }
    }),
    []
  );

  return {
    ...methods,
    location: window.location,
    path: window.location.pathname
  };
}

export default function useRouter<TRoutes extends Routes>(
  routes: TRoutes,
  config: { fallback: ComponentType<any> }
) {
  const [, rerender] = useReducer(() => Symbol(), Symbol());

  const allPaths = Object.keys(routes);

  const utils = {
    path: window.location.pathname
  };

  useEffect(() => {
    window.addEventListener("popstate", rerender);
    return () => window.removeEventListener("popstate", rerender);
  }, []);

  const methods = useHistory();

  const [pathMatch, params] = matchRoute(routes);

  const isValidPath = allPaths.includes(pathMatch);

  const FallbackComponent = config.fallback;
  const Component = isValidPath ? routes[pathMatch] : FallbackComponent;

  return [<Component location={params} />, methods, utils] as const;
}

export function Link({
  to,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { push } = useHistory();
  const aProps = {
    ...props,
    onClick: (event: any) => {
      event.preventDefault();
      push(to);
    }
  };
  return <a {...aProps} href={to} />;
}
