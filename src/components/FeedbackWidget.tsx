import React, { useEffect } from "react"
import { useLazyQuery, gql } from '@apollo/client';
import { Provider } from "./Provider"

import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Radio,
  RadioGroup,
  Input,
  Field,
  Textarea,
} from "@headlessui/react";
import clsx from "clsx";

import checked from '../assets/checked.png';
import { trimQuotes } from "../lib";

export interface IWidgetProps {
  projectId: string;
}

const types = [
  {
    id: "1",
    name: "Idea",
    emoji: "💡",
    accent: "amber",
  },
  {
    id: "2",
    name: "Issue",
    emoji: "🐛",
    accent: "red",
  },
  {
    id: "3",
    name: "Praise",
    emoji: "🙌",
    accent: "blue",
  },
  {
    id: "4",
    name: "Other",
    emoji: "💭",
    accent: "zinc",
  },
];

const AnalyseSentimentQuery = gql`
query AnalyseSentiment($text: String!) {
    analyseSentiment(text: $text) {
        sentiment
        message
    }
}
`

const EmbedFeedbackQuery = gql`
  query EmbedFeedback($stringifiedFeedback: String!, $projectId: String!) {
    embedFeedback(stringifiedFeedback: $stringifiedFeedback, projectId: $projectId) {
        feedbackCollectionMutationResult {
            collection
            status
            error
            operation
            keys
        }
    }
}

`






const APP_URL = "https://feednest.vercel.app"; // switch to your own domain for production
// const APP_URL = "http://localhost:3000";

export default function FeedbackWidget({
  projectId,
}: {
  projectId: string;
}) {
  let [isOpen, setIsOpen] = React.useState(false);
  const [hypermodeKey, setHypermodeKey] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState<null | boolean>(null);
  const [status, setStatus] = React.useState("");
  const [selected, setSelected] = React.useState(types[0]);
  const [author, setAuthor] = React.useState("");
  const [content, setContent] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("");
  const [stringifiedFeedback, setStringifiedFeedback] = React.useState("");
  const [message, setMessage] = React.useState<null | string>(null);

  // fetch hypermode api key

  useEffect(() => {
    fetch(`${APP_URL}/api/env`)
      .then((r) => r.json())
      .then((res) => {
        setHypermodeKey(res.key);
      }
      )
  }, [])
  

  const [analyseSentiment, { loading: queryLoading }] = useLazyQuery(AnalyseSentimentQuery, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hypermodeKey}`,
      },
    },
    skipPollAttempt: () => true,
    // pollInterval: 0,
    variables: {
      text: content,
      projectId: projectId,

    },
    onCompleted: (data) => {
      console.log("Data after analysis query: ", data);
      setMessage(data.analyseSentiment.message);
      // setAuthor("");
      // setContent("");
  
      // setLoading(false);
      // set the sentiment here
      const feedback = {
        projectId: projectId,
        by: author,
        content: content,
        location: location,
        country_code: countryCode,
        type: selected.name,
        route: window.location.href,
        sentiment: data.analyseSentiment.sentiment,
      }
      try {
        setLoading(true);        
        // send stringified data to the the modus api
      
        
        fetch(`${APP_URL}/api/feedback`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify(feedback),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.status === "success") {             
              // fetch the current feedback from the database 
              fetch(`${APP_URL}/api/find`, {
                method: "POST",
                mode: "cors",
                body: JSON.stringify({
                  feedbackId: res.feedbackId
                }),
              }).then((r) => r.json())
              .then(async (res) => {
              
                const stringified = JSON.stringify(res.feedback)
                setStringifiedFeedback(stringified);

                // start embedding now
               await embedFeedbackObject()
              })
            } else if (res.status === "no_such_project") {
              // setAuthor("");
              // setContent("");
              console.log(res.message);
              setStatus("no_such_project");
              setLoading(false);
              setDone(false);
              setTimeout(() => {
                setDone(null);
                setStatus("");
              }, 3500);
            }
  
            else {
              // setAuthor("");
              // setContent("");
              setStatus("fail_feedback");
              setLoading(false);
              setDone(true);
              setTimeout(() => {
                setDone(null);
              }, 3500);
            }
          });
      } catch (error) {
        setLoading(false);
        console.error(error);
        throw Error(error as string);
      }

    },
    onError: (error) => {
      console.error("Error from query: ", error);
      // setLoading(false);
      // setStatus("fail_feedback");
      // setLoading(false);
      // setDone(true);
      // setRunning(null);
      // setTimeout(() => {
      //   setDone(null);
      // }, 3500);
    }
  
  });




  const [embedFeedbackObject] = useLazyQuery(EmbedFeedbackQuery, {
    context: {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hypermodeKey}`,
      },
    },
    skipPollAttempt: () => true,
    // pollInterval: 0,
    variables: {
      stringifiedFeedback: stringifiedFeedback,
      projectId: projectId,

    },
    onCompleted: (data) => {
      console.log("Data after embed: ", data);
      setStatus("success");
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        setDone(null);
      
        // setAuthor("");
        // setContent("");
      }, 1000);
    }
  })


  



  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }


  React.useEffect(() => {
    // fetch("https://extreme-ip-lookup.com/json/")
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((response) => {
        console.log("Country is : ", response);
        setLocation(`${response.city}, ${response.country_name}`);
        setCountryCode(response.country_code);
      })
      .catch((err) => {
        console.log("Request failed:", err);
      });
  }, []);



  const handleSubmitFeedback = async () => {

    await analyseSentiment();

  };




  return (
    <Provider>
      <Button
        onClick={open}
        className="z-[999] rounded-full flex items-center fixed bottom-5 right-5 bg-blue-500 py-2 px-4 text-sm font-medium text-white focus:outline-none data-[hover]:bg-blue-600 data-[focus]:outline-1 data-[focus]:outline-white transition-all duration-100 ease-linear"
        style={{
          zIndex: 999,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 mr-1"
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
        Feedback
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-[999] focus:outline-none max-w-2xl"
        onClose={close}
        __demoMode
        style={{
          zIndex: 999,
        }}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-sm rounded-xl relative bg-white px-6 pt-5 pb-8 ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >

              {message == null ? ( 
                
            <>
              <DialogTitle
                as="h3"
                className="text-base/7 mb-3 font-medium text-black"
              >
                Submit feedback
              </DialogTitle>

              {/* ============= */}
              <div className="w-full">
                <div className="mx-auto w-full max-w-md">
                  <RadioGroup
                    by={(a, z) => a.name === z.name}
                    value={selected}
                    onChange={setSelected}
                    aria-label="Server size"
                    className="flex justify-between w-full flex-wrap sm:flex-nowrap"
                  >
                    {types.map((plan) => (
                      <Radio
                        key={plan.name}
                        value={plan}
                        className={`group mr-2 mb-2 sm:mb-0 sm:w-full flex items-center justify-between sm:justify-evenly relative cursor-pointer rounded-lg bg-white border-zinc-500 text-black  transition focus:outline-none data-[focus]:outline-2 data-[focus]:outline-blue-200 data-[checked]:bg-blue-200 data-[checked]:ring-zinc-200 ring-1 ring-gray-900/5`}
                      >
                        <span className="text-2xl pl-2 sm:pl-0">
                          {plan.emoji}
                        </span>
                        <p className="text-sm/6 pr-3 sm:pr-0">{plan.name}</p>
                      </Radio>
                    ))}
                  </RadioGroup>

                  <div className="w-full max-w-md">
                    <Field>
                      <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className={clsx(
                          "mt-3 block w-full resize-none rounded-lg border-none bg-white py-1.5 px-3 text-sm/6 text-black ring-1 ring-zinc-200",
                          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-blue-500",
                        )}
                        placeholder="Your name (Optional)"
                      />
                    </Field>
                    <Field>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={clsx(
                          "mt-3 block w-full resize-none rounded-lg border-none bg-white py-1.5 px-3 text-sm/6 text-black ring-1 ring-zinc-200",
                          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-blue-500",
                        )}
                        rows={3}
                        placeholder="Write your feedback..."
                        required
                      />
                    </Field>
                  </div>
                </div>
              </div>
              {/* ============= */}

              <div className="mt-4 w-full flex-col  gap-x-2">
       

                <Button
                  type="button"
                  onClick={() => handleSubmitFeedback()}
                  disabled={content.trim().length < 5 || loading || queryLoading}
                  className={`flex items-center mt-2 sm:mt-0 justify-center rounded-md w-full bg-blue-500 py-2 px-4 text-sm font-medium text-white focus:outline-none data-[hover]:bg-blue-600 data-[focus]:outline-1 data-[focus]:outline-white transition-all duration-100 ease-linear disabled:bg-blue-300`}
                >
                  {loading || queryLoading && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 mr-2 animate-spin"
                    >
                      <path d="M12 2v4" />
                      <path d="m16.2 7.8 2.9-2.9" />
                      <path d="M18 12h4" />
                      <path d="m16.2 16.2 2.9 2.9" />
                      <path d="M12 18v4" />
                      <path d="m4.9 19.1 2.9-2.9" />
                      <path d="M2 12h4" />
                      <path d="m4.9 4.9 2.9 2.9" />
                    </svg>
                  )}
                  {loading || queryLoading ? "Submitting..." : done ? "Submitted!" : "Submit"}
                  
                </Button>
              </div>

              {done ? (
                <p className="text-xs text-center mt-3 text-zinc-400">
                  {status === "success" && (
                    <span className="text-green-500 flex items-center justify-center">
                      👍 Feedback submitted!
                    </span>
                  )}
            
                  {status === "fail_feedback" && (
                    <span className="text-red-500 flex items-center justify-center">
                      ❌ Feedback not submitted!
                    </span>
                  )}

             
                </p>
              ) : (
                <div className="flex flex-wrap items-center mt-4 justify-between">
                  {status === "no_such_project" && (
                    <span className="text-red-500 text-center text-xs flex items-center justify-center">
                      Project does not exist!
                    </span>
                  )}
              

                  <p className="text-xs text-center mt-3 text-zinc-400">
                    Powered by{" "}
                    <a
                      href="https://feednest.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="font-medium">Feednest.</span>
                    </a>
                  </p>
                </div>
              )}
              </>
              
            ) : (
                <div className="flex flex-col items-center">
                  <img src={checked} className="h-7 w-7" />
                  <p className="text-center my-2">Feedback submitted</p>
                  <p className="text-center text-sm leading-7 mb-4">{trimQuotes(message)}</p>
                  <Button
                  type="button"
                  // refresh window to prevent polling (for some reason, it still tries to requery!)
                  onClick={() => window.location.reload()}
                  className={`flex items-center mt-4 sm:mt-0 justify-center rounded-md w-full bg-blue-500 py-2 px-4 text-sm font-medium text-white focus:outline-none data-[hover]:bg-blue-600 data-[focus]:outline-1 data-[focus]:outline-white transition-all duration-100 ease-linear disabled:bg-blue-300`}
                >
                 
                 Okay
                  
                </Button>
                </div>
              )}

             
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Provider>
  );
}
