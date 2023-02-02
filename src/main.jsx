import "./index.css";
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "https://payments.sandbox.braintree-api.com/graphql",
});

const encodeBase64 = (str) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization:
        "Basic " +
        encodeBase64(
          `${import.meta.env.VITE_APP_PUBLIC_KEY}:${
            import.meta.env.VITE_APP_PRIVATE_KEY
          }`
        ),
      "Braintree-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)
