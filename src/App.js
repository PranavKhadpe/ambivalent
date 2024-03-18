import logo from "./logo.svg";
import header from "./ambivalent.png";
import intent from "./intent.png";
import {
  Input,
  Button,
  Skeleton,
  SkeletonItem,
} from "@fluentui/react-components";
import {
  AppsAddInRegular,
  DeleteRegular,
  CalendarMonthRegular,
} from "@fluentui/react-icons";

import NumericInput from "react-numeric-input";
import TextareaAutosize from "react-textarea-autosize";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const [numinterpretations, setNumInterpretations] = useState(1);
  const [utterance, setUtterance] = useState("");
  const [alternatives, setAlternatives] = useState([]);
  const [start, setStart] = useState(false);
  const [haveCandidates, setHaveCandidates] = useState(false);
  const [weights, setWeights] = useState([]);
  const [requestedNewInterpretation, setRequestedNewInterpretation] =
    useState(false);
  const [supermessage, setSupermessage] = useState("");

  useEffect(() => {
    console.log(utterance);
  }, [utterance]);

  useEffect(() => {
    console.log(numinterpretations);
  }, [numinterpretations]);

  const ChangeNums = (e) => {
    setNumInterpretations(e);
  };

  useEffect(() => {
    console.log("Weights:" + weights);
  }, [weights]);

  const handleSubmit = async () => {
    setStart(true);

    try {
      const response = await fetch("/api/obscure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          utterance,
          numinterpretations,
        }),
      });
      const data = await response.json();
      if (data.alternatives) {
        const alternativesArray = JSON.parse(data.alternatives);
        if (alternativesArray.length > numinterpretations) {
          alternativesArray.splice(numinterpretations);
        }
        //add utterance to the start of the array
        alternativesArray.unshift(utterance);
        setAlternatives(alternativesArray); // Update the state with the parsed array
        setHaveCandidates(true);
        let intentweights = [];
        for (let i = 0; i < numinterpretations + 1; i++) {
          intentweights.push(1);
        }

        setWeights(intentweights);
      }
      if (data.message) {
        console.log(data.message);
        setSupermessage(data.message);
      }
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const fetchNewInterpretation = async () => {
    setRequestedNewInterpretation(true);
    try {
      const response = await fetch("/api/getnew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alternatives,
        }),
      });
      const data = await response.json();
      if (data.newalternative) {
        console.log(data.newalternative);
        let newalternative = data.newalternative;
        newalternative = newalternative.substring(1, newalternative.length - 1);
        const newAlternatives = [...alternatives];
        newAlternatives.push(newalternative);
        setAlternatives(newAlternatives);
        const newWeights = [...weights];
        newWeights.push(1);
        setWeights(newWeights);
        setNumInterpretations(numinterpretations + 1);
      }
      setRequestedNewInterpretation(false);
    } catch (error) {
      console.error("Error posting data:", error);
      setRequestedNewInterpretation(false);
    }
  };

  const fetchMessage = async () => {
    try {
      const response = await fetch("/api/getmessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alternatives,
          weights,
        }),
      });
      const data = await response.json();
      if (data.message) {
        setSupermessage(data.message);
        setHaveCandidates(true);
      }
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const goToStart = () => {
    setStart(false);
    setHaveCandidates(false);
    setAlternatives([]);
    setUtterance("");
    setNumInterpretations(1);
    setWeights([]);
  };

  const renderLoadingDivs = () => {
    const divs = [];
    for (let i = 0; i < numinterpretations + 1; i++) {
      divs.push(
        <div
          key={"sk" + i}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            paddingLeft: "0",
          }}
        >
          <SkeletonItem />
        </div>
      );
    }
    return divs;
  };

  return (
    <div className="App">
      <div style={{ position: "relative" }}>
        <div
          style={{
            margin: "auto",
            paddingTop: "3rem",
          }}
        >
          <AnimatePresence>
            {!start ? (
              <motion.h1
                key="content"
                style={{
                  position: "absolute", // Allows overlaying
                  width: "100%", // Ensure it doesn't collapse
                  fontWeight: "700",
                  fontFamily: "freight-text-pro, serif",
                  fontSize: "2rem",
                  margin: "0",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }} // Make relative after animation
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                Say It, Without Saying It
              </motion.h1>
            ) : (
              <motion.div
                key="back"
                style={{
                  position: "absolute", // Allows overlaying
                  width: "100%", // Match parent's width to avoid layout shift
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }} // Make relative after animation
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }} // Adjust delay to wait for exit
              >
                <motion.a
                  style={{
                    fontSize: "1rem",
                    fontWeight: "400",
                    fontFamily: "freight-micro-pro, serif",
                    fontStyle: "normal",
                    color: "rgb(28, 159, 252)",
                    display: "flex",
                    cursor: "pointer",
                  }}
                  onClick={goToStart}
                >
                  <svg
                    height="20"
                    width="20"
                    viewBox="0 0 21 21"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#1c9ffc"
                    stroke="#1c9ffc"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <g
                        fill="none"
                        fill-rule="evenodd"
                        stroke="#1C9FFC"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        transform="translate(6 6)"
                      >
                        <path d="m.5 7.5v-7h7"></path>{" "}
                        <path d="m.5.5 8 8"></path>
                      </g>
                    </g>
                  </svg>
                  back
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          style={{
            margin: "auto",
            display: "flex",
            justifyContent: "flex-start",
            marginTop: "2rem",
          }}
        >
          <hr
            style={{
              width: "20%",
              marginLeft: "0",
              marginBottom: "1rem",
              marginTop: "1rem",
              borderStyle: "none",
              borderBottom: "3px solid #FC0F68",
              height: "0.08em",
            }}
          ></hr>
        </div>
      </div>
      {!start && (
        <div
          style={{
            margin: "auto",
          }}
        >
          {/* <p
          style={{
            fontSize: "1.6rem",
            fontWeight: "bold",
            color: "rgb(28, 159, 252)",
            fontFamily: "freight-text-pro, serif",
          }}
        >
          How it works
        </p> */}
          <AnimatePresence>
            <motion.img
              style={{ width: "100%" }}
              src={header}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} // Make relative after animation
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            />
            <motion.div
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: "400",
                fontFamily: "freight-micro-pro, serif",
                fontStyle: "normal",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }} // Make relative after animation
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div style={{ display: "flex", width: "100%" }}>
                <div style={{ flex: 0.6, padding: "20px" }}>
                  Tell the system what you (don’t) want to say.
                </div>
                <div style={{ flex: 1, padding: "20px" }}>
                  The system rewrites your utterance, creating the possibility
                  for alternate interpretations of it.
                </div>
                <div style={{ flex: 1, padding: "20px" }}>
                  You can control the number of alternate interpretations you
                  want to admit, and even what these interpretations should be.
                </div>
                <div style={{ flex: 1, padding: "20px" }}>
                  You can send the modified utterance with room for alternate
                  interpretations, to the intended recipient.
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      {/* <p
        style={{
          fontSize: "1.6rem",
          fontWeight: "bold",
          width: "50%",
          margin: "auto",
          color: "rgb(28, 159, 252)",
          fontFamily: "freight-text-pro, serif",
        }}
      >
        Try it
      </p> */}
      <motion.div
        style={{
          margin: "auto",
        }}
        layout
      >
        <div style={{ borderLeft: "3px solid #FC0F68" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "start", width: "100%" }}
            >
              {/* <img src={intent} style={{ width: "110px" }} /> */}
              <TextareaAutosize
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "400",
                  fontFamily: "freight-text-pro, serif",
                  padding: "8px",
                  resize: "none",
                  marginTop: "10px",
                  flex: 1,
                  border: "1px solid #d1d1d1",
                  borderRadius: "4px",
                  marginLeft: "20px",
                }}
                minRows={2}
                placeholder="What do you (not) want to say?"
                value={utterance}
                onChange={(e) => setUtterance(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "400",
                width: "100%",
                fontFamily: "freight-text-pro, serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <div>
                <span style={{ padding: "20px" }}>
                  Number of alternate interpretations:
                </span>
                <NumericInput
                  min={1}
                  max={10}
                  value={numinterpretations}
                  style={{
                    input: {
                      fontSize: "1.2rem",
                      fontWeight: "400",
                      fontFamily: "freight-text-pro, serif",
                      padding: "8px",
                      fontVariantNumeric: "lining-nums",
                      width: "100px",
                    },
                    "input:not(.form-control)": {
                      border: "1px solid #d1d1d1",
                      borderRadius: "4px",
                    },
                  }}
                  onChange={ChangeNums}
                />
              </div>
              <div>
                {start == false ? (
                  utterance.trim() === "" ? (
                    <Button
                      size="large"
                      icon={<AppsAddInRegular />}
                      style={{
                        height: "43px",
                        fontSize: "1.2rem",
                        fontWeight: "400",
                        fontFamily: "freight-text-pro, serif",
                      }}
                      disabled
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      size="large"
                      icon={<AppsAddInRegular />}
                      style={{
                        height: "43px",
                        fontSize: "1.2rem",
                        fontWeight: "400",
                        fontFamily: "freight-text-pro, serif",
                      }}
                      onClick={() => {
                        handleSubmit();
                      }}
                    >
                      Start
                    </Button>
                  )
                ) : utterance.trim() === "" ? (
                  <Button
                    size="large"
                    icon={<AppsAddInRegular />}
                    style={{
                      height: "43px",
                      fontSize: "1.2rem",
                      fontWeight: "400",
                      fontFamily: "freight-text-pro, serif",
                    }}
                    disabled
                  >
                    Restart
                  </Button>
                ) : (
                  <Button
                    size="large"
                    icon={<AppsAddInRegular />}
                    style={{
                      height: "43px",
                      fontSize: "1.2rem",
                      fontWeight: "400",
                      fontFamily: "freight-text-pro, serif",
                    }}
                    onClick={() => {
                      handleSubmit();
                      setHaveCandidates(false);
                    }}
                  >
                    Restart
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {start && (
        <div style={{ display: "flex", marginTop: "2rem" }}>
          <div style={{ flex: 3, display: "flex" }}>
            <div style={{ flex: 1 }}>
              {haveCandidates &&
                weights.length > 0 &&
                weights.map((weight, index) => (
                  <div
                    key={"d" + index}
                    style={{
                      height: "70px",
                      marginBottom: "10px",
                    }}
                  >
                    {index > 1 && (
                      <Button
                        icon={<DeleteRegular />}
                        style={{
                          height: "100%",
                          width: "100%",
                        }}
                        onClick={() => {
                          console.log(index);
                          const newWeights = [...weights];
                          newWeights.splice(index, 1);
                          setWeights(newWeights);
                          const newAlternatives = [...alternatives];
                          newAlternatives.splice(index, 1);
                          setAlternatives(newAlternatives);
                          setNumInterpretations(numinterpretations - 1);
                        }}
                      ></Button>
                    )}
                  </div>
                ))}
            </div>
            <div style={{ flex: 7 }}>
              {!haveCandidates && renderLoadingDivs()}
              {haveCandidates &&
                alternatives.length > 0 &&
                alternatives.map((alternative, index) => (
                  <div
                    style={{
                      margin: "0",
                      height: "70px",
                      marginRight: "20px",
                      marginBottom: "10px",
                    }}
                    key={"a" + index}
                  >
                    <textarea
                      style={{
                        fontSize: "1.2rem",
                        width: "100%",
                        boxSizing: "border-box",
                        fontWeight: "400",
                        fontFamily: "freight-text-pro, serif",
                        padding: "8px",
                        resize: "none",
                        border: "1px solid #d1d1d1",
                        borderRadius: "4px",
                        height: "100%",
                      }}
                      value={alternative}
                      onChange={(e) => {
                        const newAlternatives = [...alternatives];
                        newAlternatives[index] = e.target.value;
                        setAlternatives(newAlternatives);
                      }}
                    />
                  </div>
                ))}
              {requestedNewInterpretation && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "20px",
                    paddingLeft: "0",
                  }}
                >
                  <SkeletonItem />
                </div>
              )}
              {haveCandidates && (
                <div style={{ marginRight: "20px" }}>
                  {requestedNewInterpretation == false ? (
                    <Button
                      icon={<CalendarMonthRegular />}
                      style={{
                        width: "100%",
                        height: "43px",
                        fontSize: "1.2rem",
                        fontWeight: "400",
                        fontFamily: "freight-text-pro, serif",
                      }}
                      onClick={fetchNewInterpretation}
                    >
                      Add another interpretation
                    </Button>
                  ) : (
                    <Button
                      icon={<CalendarMonthRegular />}
                      style={{
                        width: "100%",
                        height: "43px",
                        fontSize: "1.2rem",
                        fontWeight: "400",
                        fontFamily: "freight-text-pro, serif",
                      }}
                      onClick={fetchNewInterpretation}
                      disabled
                    >
                      Add another interpretation
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div style={{ flex: 2 }}>
              {haveCandidates &&
                weights.length > 0 &&
                weights.map((weight, index) => (
                  <div
                    key={"w" + index}
                    style={{ height: "70px", marginBottom: "10px" }}
                  >
                    <NumericInput
                      min={-100}
                      max={100}
                      step={5}
                      value={weight}
                      style={{
                        input: {
                          fontSize: "1.2rem",
                          fontWeight: "400",
                          fontFamily: "freight-text-pro, serif",
                          padding: "8px",
                          fontVariantNumeric: "lining-nums",
                          width: "100%",
                          height: "70px",
                          boxSizing: "border-box",
                        },
                        "input:not(.form-control)": {
                          border: "1px solid #d1d1d1",
                          borderRadius: "4px",
                        },
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
          <div style={{ flex: 2 }}>
            {!haveCandidates && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px",
                  paddingLeft: "0",
                }}
              >
                <SkeletonItem />
              </div>
            )}
            {haveCandidates && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "start",
                    width: "100%",
                  }}
                >
                  {/* <img src={intent} style={{ width: "110px" }} /> */}
                  <TextareaAutosize
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "400",
                      fontFamily: "freight-text-pro, serif",
                      padding: "8px",
                      resize: "none",
                      flex: 1,
                      border: "1px solid #d1d1d1",
                      borderRadius: "4px",
                      marginLeft: "20px",
                    }}
                    value={supermessage}
                    onChange={(e) => setSupermessage(e.target.value)}
                  />
                </div>
                <div style={{ marginLeft: "20px" }}>
                  <Button
                    icon={<CalendarMonthRegular />}
                    style={{
                      width: "100%",
                      height: "43px",
                      fontSize: "1.2rem",
                      fontWeight: "400",
                      fontFamily: "freight-text-pro, serif",
                    }}
                    onClick={() => {
                      fetchMessage();
                      setHaveCandidates(false);
                    }}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
