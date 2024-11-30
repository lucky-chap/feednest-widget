<p align="center">
  <img src="public/banner.png" alt="Next.js and TypeScript">
</p>


# Feednest Widget
This widget is to be used alongside [Feednest](https://feednest.vercel.app)

## How to use
- Install widget with ```npm install feednest ```
- Feednest also depends on apollo and grapqhql. Install them like so ```npm install @apollo/client graphql ```
- Import the widget like so: ```import { FeedbackWidget } from "feednest" ```
- Import the css file for styling ```import "feednest/dist/index.css"```
- Wrap your project with ``ApolloProvider``, imported from the ``@apollo/client`` package
- Import ``client`` from ``feednest``
- Fill with right props
- Full example

```tsx 
import "feednest/dist/index.css";
import { FeedbackWidget, client } from "feednest";
import { ApolloProvider } from "@apollo/client";

<ApolloProvider client={client}>
  <FeedbackWidget projectId="your_project_id" />
</ApolloProvider>
```

- Enjoy collecting feedback!

**NB:** You can find your credentials in the project page when you create an project. Log in to [Feednest](https://feednest.vercel.app) to do this!