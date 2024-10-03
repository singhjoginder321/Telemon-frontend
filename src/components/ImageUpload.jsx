import React, { useEffect, useRef, useState } from "react";
import "../styles/ImageUpload.css";

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageSize, setImageSize] = useState({ width: 900, height: 700 });
  const [rectangles, setRectangles] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null);
  const [description, setDescription] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [hoveredRectangleIndex, setHoveredRectangleIndex] = useState(null);
  const [currentRectangle, setCurrentRectangle] = useState(null);

  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.imageUrl) {
      setImageUrl(data.imageUrl);
      imgRef.current.src = data.imageUrl;
      imgRef.current.onload = () => drawImageOnCanvas();
      setRectangles([]); // Clear rectangles on new image upload
    } else {
      console.error("No image URL returned from server");
    }
  };

  const drawImageOnCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, imageSize.width, imageSize.height);

    rectangles.forEach((rect) => {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });

    if (isDrawing && currentBox) {
      // Draw the dotted rectangle while drawing
      ctx.setLineDash([5, 5]); // Dotted line
      ctx.strokeStyle = "blue"; // Change color for the dotted line
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentBox.x,
        currentBox.y,
        currentBox.width,
        currentBox.height
      );
      ctx.setLineDash([]); // Reset line dash to solid for other rectangles
    }
  };

  const handleMouseDown = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setStartPoint({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
    setIsDrawing(true);
    setShowInput(false);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentBox({
      x: startPoint.x,
      y: startPoint.y,
      width: x - startPoint.x,
      height: y - startPoint.y,
    });

    drawImageOnCanvas();
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setShowInput(true);

      const finalRectangle = {
        // x: Math.min(startPoint.x, startPoint.x + currentBox.width),
        // y: Math.min(startPoint.y, startPoint.y + currentBox.height),
        x: Math.min(startPoint.x),
        y: Math.min(startPoint.y),
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
        description: description || "No description",
      };

      // Store the rectangle in both rectangles and currentRectangle
      setRectangles((prev) => [...prev, finalRectangle]);
      setCurrentRectangle(finalRectangle); // Set the current rectangle
      setCurrentBox(null); // Reset the current box to stop drawing
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    imgRef.current.onload = () => drawImageOnCanvas();

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing, currentBox]);

  return (
    <div className="image-upload-container">
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        <button type="submit" className="upload-button">
          Upload
        </button>
        <div className="image-size-controls">
          <label>
            Width:
            <input
              type="number"
              value={imageSize.width}
              onChange={(e) =>
                setImageSize({
                  ...imageSize,
                  width: Math.max(50, parseInt(e.target.value)),
                })
              }
              className="size-input"
            />
          </label>
          <label>
            Height:
            <input
              type="number"
              value={imageSize.height}
              onChange={(e) =>
                setImageSize({
                  ...imageSize,
                  height: Math.max(50, parseInt(e.target.value)),
                })
              }
              className="size-input"
            />
          </label>
        </div>
        <canvas
          ref={canvasRef}
          id="canvas"
          width={1000}
          height={900}
          className="canvas"
          onMouseMove={handleMouseMove}
        />
      </form>

      {rectangles.map((rect, index) => (
        <div
          key={index}
          className="rectangle"
          style={{
            position: "absolute",
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            width: `${Math.abs(rect.width)}px`,
            height: `${Math.abs(rect.height)}px`,
            backgroundColor:
              hoveredRectangleIndex === index
                ? "rgba(255, 255, 224, 0.8)"
                : "transparent",
            border: "3px solid orange",
            boxSizing: "border-box",
          }}
          onMouseEnter={() => setHoveredRectangleIndex(index)}
          onMouseLeave={() => setHoveredRectangleIndex(null)}
        >
          {hoveredRectangleIndex === index && (
            <div className="rectangle-info">
              <p>X: {rect.x}</p>
              <p>Y: {rect.y}</p>
              <p>Width: {Math.abs(rect.width)}</p>
              <p>Height: {Math.abs(rect.height)}</p>
              <p>Description: {rect.description}</p>
            </div>
          )}
        </div>
      ))}

      {currentRectangle && (
        <div
          className="rectangle-info"
          style={{
            position: "absolute",
            left: `${currentRectangle.x}px`,
            top: `${currentRectangle.y}px`,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            transform: "translateY(-100%)", // Move above the rectangle
          }}
        >
          <p>X: {currentRectangle.x}</p>
          <p>Y: {currentRectangle.y}</p>
          <p>Width: {Math.abs(currentRectangle.width)}</p>
          <p>Height: {Math.abs(currentRectangle.height)}</p>
          <p>Description: {currentRectangle.description}</p>
        </div>
      )}

      {showInput && (
        <div className="description-input">
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter description"
            className="description-text-input"
          />
          {/* Remove the button */}
          <button
            onClick={() => {
              const lastRectangle = rectangles[rectangles.length - 1];
              if (lastRectangle) {
                lastRectangle.description = description || "No description";
                setRectangles([...rectangles]);
              }
              setDescription("");
              setShowInput(false);
            }}
            className="save-button"
          >
            Save Description
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
