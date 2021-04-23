import React, {
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
    .filter(Boolean);

  const params = (resultMatch || {}).params as Record<string, string | number>;
  return [routeMatched, params] as const;
}

function useHistory() {
  const methods = useMemo(
    () => ({
      push: (path: string) => {
        if (window.location.pathname === path) return;
        window.history.pushState(null, path, path);
        window.dispatchEvent(new Event("popstate"));
      },
      replace: (path: string) => {
        if (window.location.pathname === path) return;
        window.history.replaceState(null, path, path);
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

  const allRoutes = Object.keys(routes);

  useEffect(() => {
    window.addEventListener("popstate", rerender);
    return () => window.removeEventListener("popstate", rerender);
  }, []);

  const history = useHistory();

  const [pathMatch, params] = matchRoute(routes);

  const isValidPath = allRoutes.includes(pathMatch);

  const FallbackComponent = config.fallback;
  const Component = isValidPath ? routes[pathMatch] : FallbackComponent;

  return [<Component location={params} />, history] as const;
}

export function Link({
  to,
  children,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { push } = useHistory();
  const aProps = {
    ...props,
    onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      push(to);
    }
  };
  return (
    <a {...aProps} href={to}>
      {children}
    </a>
  );
}
