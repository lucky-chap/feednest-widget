import "./index.css";
import FeedbackWidget from "./components/FeedbackWidget";
import { IWidgetProps } from "./components/FeedbackWidget"
import { client } from "./components/Provider"

// export interface IWidgetProps {
//     userId: string;
//     userEmail: string;
//     orbitId: string;
//   }


export { FeedbackWidget };
export { client };
export type { IWidgetProps }