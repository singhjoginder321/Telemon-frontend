import axios from "axios";
import { Document, Page } from "react-pdf";

import React, { useEffect, useRef, useState } from "react";
import "../styles/Upload.css";

function Upload() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [start, setStart] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [cursor, setCursor] = useState("default");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      axios
        .post("http://localhost:5000/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          setImageUrl(response.data.imageUrl);
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = response.data.imageUrl;
          img.onload = () => {
            setCanvasSize({ width: img.width, height: img.height });
          };
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
        });

      setImage(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    ctxRef.current = context;

    const drawImage = (imgSrc) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imgSrc;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    };

    if (isEditMode && imageUrl) {
      drawImage(imageUrl);
    }
  }, [imageUrl, isEditMode]);

  const handleMouseDown = (e) => {
    if (!isEditMode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !start) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const end = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const newRect = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };

    setCurrentRect(newRect);
  };

  const handleMouseUp = (e) => {
    if (!isEditMode || !start) return;

    const canvas = canvasRef.current;
    const context = ctxRef.current;
    const rect = canvas.getBoundingClientRect();
    const end = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const newRect = {
      x: start.x,
      y: start.y,
      width: end.x - start.x,
      height: end.y - start.y,
    };

    context.strokeStyle = "red";
    context.lineWidth = 2;
    context.strokeRect(newRect.x, newRect.y, newRect.width, newRect.height);

    console.log("Rectangle Data:", newRect);

    setStart(null);
    setIsDrawing(false);
    setCurrentRect(null);
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL();
      setEditedImageUrl(dataUrl);
      setCursor("default");
    } else {
      setCursor("crosshair");
    }
    setIsEditMode((prev) => !prev);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="left-section">
          <h2>Image Preview</h2>
          {image ? (
            <img src={image} alt="Uploaded Preview" className="image-preview" />
          ) : (
            <p>No Image Uploaded Yet</p>
          )}
        </div>

        <div className="right-section">
          <h2>Components Display</h2>
          {editedImageUrl ? (
            <img
              src={editedImageUrl}
              alt="Processed"
              className="image-preview"
              style={{ width: "100%", height: "auto" }}
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Processed"
              className="image-preview"
              style={{ width: "100%", height: "auto" }}
            />
          ) : (
            <p>No Components Display Yet</p>
          )}
        </div>
      </div>

      {!imageUrl && (
        <div className="upload-container">
          <div className="file-upload-area">
            <input
              type="file"
              accept="image/*,application/pdf"
              id="fileInput"
              onChange={handleImageUpload}
            />
            <label htmlFor="fileInput" className="upload-label">
              <div className="drag-drop-text">Drag and drop here</div>
              <div className="upload-button">Upload Here</div>
              <div className="data-format-text">
                Data Format: JPG, PNG, JPEG, PDF
              </div>
            </label>
          </div>
        </div>
      )}

      {imageUrl && (
        <button
          className={`edit-button ${isEditMode ? "active" : ""}`}
          onClick={handleEditToggle}
        >
          {isEditMode ? "Stop Editing" : "Edit"}
        </button>
      )}

      {isEditMode && (
        <div className="modal">
          <div className="modal-content">
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: cursor }}
              />
              {currentRect && (
                <div
                  className="dotted-rectangle"
                  style={{
                    left: `${currentRect.x}px`,
                    top: `${currentRect.y}px`,
                    width: `${currentRect.width}px`,
                    height: `${currentRect.height}px`,
                  }}
                />
              )}
            </div>
            <button className="close-button" onClick={handleEditToggle}>
              Close Editing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;
