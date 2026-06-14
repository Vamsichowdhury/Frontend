import cat1 from "./assets/cat1.png";
import cat2 from "./assets/cat2.png";
import cat3 from "./assets/cat3.png";
import { useState } from "react";

export default function ImageGallery() {
  const images = [cat1, cat2, cat3];
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div>ImageGallery</div>
      {images.map((image, index) => {
        return (
          <img
            key={index}
            src={image}
            alt={`Cat ${index + 1}`}
            onClick={() => setSelectedImage(image)}
          />
        );
      })}
      <h2>Preview</h2>
      {selectedImage && <img src={selectedImage} alt="Selected Cat" />}
    </>
  );
}
