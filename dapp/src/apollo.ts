import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/experimental-nextjs-app-support";
import { SUBGRAPH_URI } from "@/config";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";

if (process.env.NODE_ENV !== "production") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

// By not creating a new cache instance inside `registerApolloClient` (the "recommended" way to do it)
// we avoid having a new cache store created for each request, which makes caching actually work, since now
// we share a single cache store for all requests.
const cache = new InMemoryCache({
  resultCaching: true,
});

export const { query } = registerApolloClient(() => {
  return new ApolloClient({
    cache,
    link: new HttpLink({
      uri: SUBGRAPH_URI,
      fetch: (input, init) => {
        if (process.env.NODE_ENV !== "production") {
          const body = init?.body && JSON.parse(init.body.toString());
          const operations =
            (Array.isArray(body)
              ? body
              : ([body]?.map?.((ops: any) => ops.operationName) as
                  | string[]
                  | undefined)) ?? [];

          console.log(
            `[${new Date().toISOString()}] Apollo Query:`,
            operations.join(", "),
          );
        }

        return fetch(input, { ...init });
      },
    }),
  });
});
