<p align="center">
  <img src="public/banner.png" alt="Next.js and TypeScript">
</p>


# Orbitfeed Widget
This widget is to be used alongside [Orbitfeed](https://orbitfeed.vercel.app)

## How to use
- Install widget with ```npm install orbitfeed ```
- Import the widget like so: ```import { FeedbackWidget } from "orbitfeed" ```
- Import the css file for styling ```import "orbitfeed/dist/index.css"```
- Fill with right props. eg.

```tsx 
<FeedbackWidget userId="your_user_id_here" userEmail="coolme@mail.com" orbitId="your_orbit_id" />
```

- Enjoy collecting feedback!

**NB:** You can find your credentials in the orbit page when you create an orbit. Log in to [Orbitfeed](https://orbitfeed.vercel.app) to do this!