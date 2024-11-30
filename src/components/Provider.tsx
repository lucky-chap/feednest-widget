import React from 'react';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';


const APOLLO_URI = `https://feednest-api-huncho.hypermode.app/graphql`; // for production
// const APOLLO_URI = `http://localhost:8686/graphql`;


const client = new ApolloClient({
    uri: APOLLO_URI,
    cache: new InMemoryCache(),
});
  

export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    )
}   