import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utils";
import * as fp from "fingerpose";
import RaisedHandGesture from "./gestures/RaisedHand.js";
import LoveYouGesture from "./gestures/LoveYou.js";
import CallMeGesture from "./gestures/CallMe.js";
import RaisedFistGesture from "./gestures/RaisedFist.js";
import victory from "./img/victory.png";
import OkSign from "./img/ok_sign.png";
import thumbs_up from "./img/thumbs_up.png";
import raised_hand from "./img/raised_hand.png";
import love_you from "./img/love_you.png";
import call_me from "./img/call_me.png";
import raised_fist from "./img/raised_fist.png";
import thumbs_down from "./img/thumbs_down.png";
import rock_on from "./img/rock_on.png";
// import point_up from "./img/point_up.png";
// import point_down from "./img/point_down.png";
// import point_left from "./img/point_left.png";
// import point_right from "./img/point_right.png";
// import pinched_hand from "./img/pinched_hand.png";
// import pinched_finger from "./img/pinched_finger.png";
// import middle_finger from "./img/middle_finger.png";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const photoRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [emoji, setEmoji] = useState(null);

  const takePhoto = () => {
    const width = 414;
    const height = 240;
    const video = webcamRef.current.video;
    const photo = document.createElement("canvas");
    // let photo = photoRef.current;

    photo.width = width;
    photo.height = height;

    let ctx = photo.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    setCapturedPhoto(photo.toDataURL("image/png"));
    setHasPhoto(true);
  };

  // const closePhoto = () => {
  //   setCapturedPhoto(null)
  //   // let photo = photoRef.current;
  //   // let ctx = photo.getContext("2d");
  //   // ctx.clearRect(0, 0, photo.width, photo.height);
  //   setHasPhoto(false);
  //   console.log("yopilvotti");
  // };

  const images = {
    thumbs_up: thumbs_up,
    OkSign: OkSign,
    victory: victory,
    raised_hand: raised_hand,
    love_you: love_you,
    call_me: call_me,
    raised_fist: raised_fist,
    thumbs_down: thumbs_down,
    rock_on: rock_on,
    // point_up: point_up,
    // point_down: point_down,
    // point_left: point_left,
    // middle_finger: middle_finger,
    // pinched_finger: pinched_finger,
    // pinched_hand: pinched_hand,
    // point_right: point_right,
  };

  const runHandpose = async () => {
    const net = await handpose.load();
    // loop and detect hand
    setInterval(() => {
      detect(net);
    }, 100);
  };
  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current != null &&
      webcamRef.current.video.readyState === 4
    ) {
      // get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // set video width and height
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      // set canvas width and height
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      // make detection
      const hand = await net.estimateHands(video);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
          RaisedHandGesture,
          LoveYouGesture,
          CallMeGesture,
          RaisedFistGesture,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 8);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map(
            (prediction) => prediction.score
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          setEmoji(gesture.gestures[maxConfidence].name);
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 800,
            height: 550,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 800,
            height: 550,
          }}
        />

        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )}
        {capturedPhoto && (
          <img
            src={capturedPhoto}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 60,
              textAlign: "center",
              height: 140,
            }}
            alt="Captured"
          />
        )}
      </header>

      <button onClick={takePhoto}>SNAP!</button>
      <div className={"result" + (hasPhoto ? "hasPhoto" : "")}>
        {/* <canvas ref={photoRef}></canvas> */}
      </div>
    </div>
  );
}

export default App;
