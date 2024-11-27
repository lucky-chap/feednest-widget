import React from "react"

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

import { useUploadFiles } from "@xixixao/uploadstuff/react";

export interface IWidgetProps {
  userId: string;
  userEmail: string;
  orbitId: string;
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

const MAX_SIZE = 3072;
const file_types = [
  "image/jpg",
  "image/png",
  "image/jpeg",
  "image/bmp",
  "image/gif",
];

  const APP_URL = "https://orbitfeed.vercel.app";
  // const APP_URL = "http://localhost:3000";

export default function FeedbackWidget({
  userId,
  userEmail,
  orbitId,
}: IWidgetProps) {
  let [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState<null | boolean>(null);
  const [status, setStatus] = React.useState("");
  const [running, setRunning] = React.useState<null | string>(null);
  const [selected, setSelected] = React.useState(types[0]);
  const [fileError, setFileError] = React.useState(false);
  const [author, setAuthor] = React.useState("");
  const [content, setContent] = React.useState("");
  const [uploadUrl, setUploadUrl] = React.useState<null | string>(null);
  const [feedbackId, setFeedbackId] = React.useState<null | string>(null);
  //   const [uploadSuccessful, setUploadSuccessful] = React.useState<boolean | null>(
  //     null,
  //   );
  const [file, setFile] = React.useState<undefined | File>();
  const [location, setLocation] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("");

  const { startUpload } = useUploadFiles(uploadUrl as string);

  console.log("INitial upload url: ", uploadUrl);

  console.log("Hi there, I am the feedback widget");



  console.log("APP_URL: ", APP_URL)

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function handleFileChange(e: any) {
    // file is set to undefined to clear the file state
    setFile(undefined);
    const size = Math.round(e.target.files[0].size / 1024);
    if (
      (e.target.files[0] !== undefined && size > MAX_SIZE) ||
      file_types.includes(e.target.files[0]?.type as string) == false
    ) {
      setFile(undefined);
      setFileError(true);
      setTimeout(() => {
        setFileError(false);
      }, 3500);
      console.log("Selected file: ", e.target.files[0]);
      return;
    } else {
      console.log(e.target.files[0]);
      const f = e.target.files[0];
      setFile(f);
      console.log("Selected file: ", f);
    }
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

  React.useEffect(() => {
    if (file !== undefined && uploadUrl !== null) {
      async function upload() {
        const uploaded = await startUpload([file] as File[]);
        const uploadResponse = uploaded[0].response as any;
        console.log("Uploaded file response: ", uploaded);
        // now save storage id
        if (feedbackId !== null) {
          await fetch(`${APP_URL}/api/upload`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({
              feedbackId: feedbackId as any,
              storageId: uploadResponse.storageId,
            }),
          })
            .then((r) => r.json())
            .then(async (res) => {
              console.log("Res from server after upload storage id: ", res);
              if (res.status === "success") {
                // let the backend serve the file and store result
                // in feedback table
                await fetch(`${APP_URL}/api/serve`, {
                  method: "POST",
                  mode: "cors",
                  body: JSON.stringify({
                    feedbackId: feedbackId as any,
                    storageId: uploadResponse.storageId,
                  }),
                })
                  .then((r) => r.json())
                  .then(async (res) => {
                    console.log("Res from server after serve: ", res);
                    if (res.status === "success") {
                      console.log("Gotten to the store area: ", res);
                      // patch the feedback with the new image (using a post request lol)
                      await fetch(`${APP_URL}/api/store`, {
                        method: "POST",
                        mode: "cors",
                        body: JSON.stringify({
                          feedbackId,
                          image: res.url,
                        }),
                      })
                        .then((r) => r.json())
                        .then((res) => {
                          if (res.status === "success") {
                            // setUploadSuccessful(true);
                            setAuthor("");
                            setContent("");
                            setStatus("success");
                            setLoading(false);
                            setDone(true);
                            setRunning(null);
                            setFile(undefined);
                            setUploadUrl(null);
                            setTimeout(() => {
                              setDone(null);
                              setAuthor("");
                              setContent("");
                            }, 3500);
                          } else {
                            // setUploadSuccessful(false);
                            setStatus("fail_upload");
                            setLoading(false);
                            setDone(true);
                            setRunning(null);
                            setFile(undefined);
                            setUploadUrl(null);
                            setTimeout(() => {
                              setDone(null);
                            }, 3500);
                          }
                        });
                    } else {
                      console.log("Failed to get to the serve area");
                      //   setUploadSuccessful(false);
                      setStatus("fail_upload");
                      setLoading(false);
                      setDone(true);
                      setRunning(null);
                      setFile(undefined);
                      setUploadUrl(null);
                      setTimeout(() => {
                        setDone(null);
                      }, 3500);
                    }
                  });
              } else if (res.status === "limit_reached") {
                setStatus("limit_reached");
                setLoading(false);
                setDone(false);
                setRunning(null);
                setTimeout(() => {
                  setDone(null);
                }, 3500);
              } else if (res.status === "paused") {
                setStatus("paused");
                setLoading(false);
                setDone(true);
                setRunning(null);
                setTimeout(() => {
                  setDone(null);
                }, 3500);
              } else {
                // setUploadSuccessful(false);
                setStatus("fail_upload");
                setLoading(false);
                setDone(true);
                setRunning(null);
                setFile(undefined);
                setUploadUrl(null);
                setTimeout(() => {
                  setDone(null);
                }, 3500);
              }
            });
        }
      }

      upload();
    }
  }, [uploadUrl]);

  const handleSubmitFeedback = async () => {
    console.log("Current file state", file);

    try {
      setLoading(true);
      setRunning("feedback");

      //   create feedback first since upload depends on feedbackId
      fetch(`${APP_URL}/api/feedback`, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
          userId: userId,
          userEmail: userEmail,
          orbitId: orbitId,
          by: author,
          content: content,
          location: location,
          country_code: countryCode,
          type: selected.name,
          route: window.location.href,
          image: "",
          image_storage_id: undefined,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.status === "success") {
            console.log("Newly created feedback: ", res);
            setFeedbackId(res.feedbackId);
            // since this is done, try uploading image
            // send request to get upload url
            if (file !== undefined) {
              fetch(`${APP_URL}/api/upload`, {
                method: "GET",
                mode: "cors",
              })
                .then((r) => r.json())
                .then(async (res) => {
                  // res is an object with the status and url field (next.js api route)
                  if (res.status === "success") {
                    console.log("Upload url from server: ", res.url);

                    setRunning("upload");
                    setUploadUrl(res.url);
                  }
                });
            } else {
              setAuthor("");
              setContent("");
              setStatus("success");
              setLoading(false);
              setDone(true);
              setRunning(null);
              setTimeout(() => {
                setDone(null);
                setAuthor("");
                setContent("");
              }, 3500);
            }
          } else if (res.status === "no_such_orbit") {
            console.log(res.message);
            setStatus("no_such_orbit");
            setLoading(false);
            setDone(false);
            setFile(undefined);
            setRunning(null);
            setTimeout(() => {
              setDone(null);
              setStatus("");
            }, 3500);
          }
          
          else if (res.status === "limit_reached") {
            console.log(res.message);
            setStatus("limit_reached");
            setLoading(false);
            setDone(false);
            setFile(undefined);
            setRunning(null);
            setTimeout(() => {
              setDone(null);
              setStatus("");
            }, 3500);
          } else if (res.status === "paused") {
            console.log("IT failed? ", res);
            setStatus("paused");
            setLoading(false);
            setDone(true);
            setRunning(null);
            setTimeout(() => {
              setDone(null);
            }, 3500);
          } else {
            // console.log("IT failed? ", res);
            setStatus("fail_feedback");
            setLoading(false);
            setDone(true);
            setRunning(null);
            setTimeout(() => {
              setDone(null);
            }, 3500);
          }
        });
    } catch (error) {
      console.error(error);
      throw Error(error as string);
    }
  };

  return (
    <>
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

              <div className="mt-4 w-full flex-col sm:grid sm:grid-cols-8 gap-x-2">
                <div className="flex items-center justify-center w-full">
                  <label
                    aria-disabled={running !== null}
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-10 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 disabled:hover:bg-gray-50 disabled:cursor-not-allowed"
                  >
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
                      className="w-5 text-zinc-400"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <input
                      id="dropzone-file"
                      type="file"
                      multiple={false}
                      onChange={(e) => handleFileChange(e)}
                      className="hidden"
                      accept="image/*"
                      disabled={running !== null}
                    />
                  </label>
                </div>

                <Button
                  onClick={handleSubmitFeedback}
                  disabled={content.trim().length < 3 || loading}
                  className={`flex items-center mt-2 sm:mt-0 justify-center col-span-7 rounded-md w-full bg-blue-500 py-2 px-4 text-sm font-medium text-white focus:outline-none data-[hover]:bg-blue-600 data-[focus]:outline-1 data-[focus]:outline-white transition-all duration-100 ease-linear disabled:bg-blue-300`}
                >
                  {loading && (
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
                  {/* {loading ? "Submitting..." : done ? "Submitted!" : "Submit"} */}
                  {loading &&
                    running === "feedback" &&
                    "Submitting feedback..."}
                  {loading && running === "upload" && "Uploading image..."}
                  {!loading && running == null && "Submit"}
                </Button>
              </div>

              {done || fileError ? (
                <p className="text-xs text-center mt-3 text-zinc-400">
                  {status === "success" && (
                    <span className="text-green-500 flex items-center justify-center">
                      👍 Feedback submitted!
                    </span>
                  )}
                  {status === "paused" && (
                    <span className="text-amber-500 text-center text-xs flex items-center justify-center">
                      ⚠️ Feedback not submitted because creator has paused
                      feedbacks for this project!
                    </span>
                  )}
                  {status === "fail_feedback" && (
                    <span className="text-red-500 flex items-center justify-center">
                      ❌ Feedback not submitted!
                    </span>
                  )}

                  {status === "fail_upload" && (
                    <span className="text-red-500 flex items-center justify-center">
                      ❌ Feedback submitted, but image not uploaded!
                    </span>
                  )}

                  {fileError && (
                    <span className="text-red-500 flex items-center justify-center">
                      ❌ File should be an image and up to 3MB!
                    </span>
                  )}
                </p>
              ) : (
                <div className="flex flex-wrap items-center mt-4 justify-between">
                  {status === "no_such_orbit" && (
                    <span className="text-red-500 text-center text-xs flex items-center justify-center">
                      Project does not exist!
                    </span>
                  )}
                  {status === "limit_reached" && (
                    <span className="text-amber-500 text-center text-xs flex items-center justify-center">
                      ⚠️ Feedback not submitted because creator has reached
                      maximum limit!
                    </span>
                  )}

                  {file !== undefined && (
                    <p
                      onClick={() => setFile(undefined)}
                      className="text-xs cursor-pointer flex items-center text-center mt-3 text-blue-400"
                    >
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
                        className="w-4 mr-1"
                      >
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      {file.name.length > 22
                        ? file?.name.substring(0, 22) + "..."
                        : file.name}{" "}
                    </p>
                  )}
                  <p className="text-xs text-center mt-3 text-zinc-400">
                    Powered by{" "}
                    <a
                      href="https://orbitfeed.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="font-medium">Orbitfeed.</span>
                    </a>
                  </p>
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
