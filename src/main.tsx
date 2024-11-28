import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import "./index.css";

import FeedbackWidget from "./components/FeedbackWidget.tsx";
// const userId = import.meta.env.VITE_APP_USER_ID

// const USER_ID = `${import.meta.glob.VITE_APP_USER_ID}`;
// const USER_EMAIL = `${import.meta.env.VITE_APP_USER_EMAIL}`;
// const ORBIT_ID = `${import.meta.env.VITE_APP_ORBIT_ID}`;

// The react app is good for testing out the widget and looking at how it will
// look before publishing. You can add a dummy orbitId here and test against
// your orbits.

// import { FeedbackWidget } from "../dist/index"

const client = new ApolloClient({
  uri: 'http://localhost:8686/graphql',
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
   <ApolloProvider client={client}>
    <FeedbackWidget projectId='kn75yaw5jxpr275s7tmnhjdf8h75fx75' />
   </ApolloProvider>

{/* <FeedbackWidget userId="kn73ps1enahzbqmmj0gy6t110h70xtfg" userEmail="hunchodotdev@gmail.com" orbitId="kd73atavksyxdqdbbgkxpwp5cd70xbvj" /> */}


{/* <FeedbackWidget userId='kn73ps1enahzbqmmj0gy6t110h70xtfg' userEmail='hunchodotdev@gmail.com' orbitId='kd73atavksyxdqdbbgkxpwp5cd70xbvj' /> */}
{/* <FeedbackWidget userId='jx736m18cgqqwjg35cht2a388d6z7w2y' userEmail='hunchodotdev@gmail.com' orbitId='k973pj8j1pdx5qrcbt0m1pym0570y3t6' /> */}
{/* <FeedbackWidget userId='jx736m18cgqqwjg35cht2a388d6z7w2y' userEmail='hunchodotdev@gmail.com' orbitId='k973pj8j1pdx5qrcbt0m1pym0570y3t6' /> */}
  </StrictMode>,
);
