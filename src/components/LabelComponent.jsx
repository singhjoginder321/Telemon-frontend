import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles/LabelComponent.css";

function LabelComponent() {
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [formData, setFormData] = useState({
    type: "",
    material: "",
    length: "",
  });
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/image/input.png")
      .then((response) => {
        const url = response.data.imageUrl; // Access imageUrl from the response
        setImageSrc(url); // Set the image source
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  }, []);

  // Fetch image on mount
  //   useEffect(() => {
  //     axios
  //       .get("http://localhost:5000/api/image/accuracy.png", {
  //         responseType: "blob",
  //       })
  //       .then((response) => {
  //         const url = URL.createObjectURL(response.data);
  //         setImageSrc(url);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching image:", error);
  //       });
  //   }, []);

  const handleAddLabel = () => {
    setIsAddingLabel(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    setIsAddingLabel(false); // Revert to Component List after form submission
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="label-component">
      {/* Left side image */}
      <div className="image-section">
        {imageSrc ? (
          <img src={imageSrc} alt="Fetched from API" className="api-image" />
        ) : (
          <p>Loading image...</p>
        )}
      </div>

      {/* Right side */}
      <div className="right-section">
        {isAddingLabel ? (
          <form className="label-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type:</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Material:</label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Length:</label>
              <input
                type="text"
                name="length"
                value={formData.length}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        ) : (
          <div className="component-list">
            <h2>Component List</h2>
            <table>
              <thead>
                <tr>
                  <th>S. No.</th>
                  <th>Type</th>
                  <th>Length</th>
                  <th>Quantity</th>
                  <th>Cost per Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Wire</td>
                  <td>123</td>
                  <td>27</td>
                  <td>27</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Junction</td>
                  <td>343</td>
                  <td>16</td>
                  <td>27</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Connector</td>
                  <td>873</td>
                  <td>9</td>
                  <td>27</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Dimension</td>
                  <td>213</td>
                  <td>20</td>
                  <td>27</td>
                </tr>
              </tbody>
            </table>

            <div className="button-group">
              <button className="add-label-button" onClick={handleAddLabel}>
                Add Label
              </button>
              <button className="bill-button">Bill</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LabelComponent;
