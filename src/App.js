// src/App.js
import React, { useState } from 'react';
import './App.css';

const API_URL = "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud";
const API_KEY = "VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM";

function App() {
  const [comicText, setComicText] = useState(Array(10).fill(''));
  const [annotationPanelText, setAnnotationPanelText] = useState(Array(10).fill(''));
  const [comicImages, setComicImages] = useState(Array(10).fill(null));
  const [loading, setLoading] = useState(false);

  const handleInputChange = (index, value) => {
    const newText = [...comicText];
    newText[index] = value;
    setComicText(newText);
  };

  const handleAnnotationChange = (index, value) => {
    const newAnnotationText = [...annotationPanelText];
    newAnnotationText[index] = value;
    setAnnotationPanelText(newAnnotationText);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const allImages = await Promise.all(
        comicText.map(async (text, index) => {
          if (!text) {
            return { imageUrl: null, annotation: "Write some text inorder to generate a Comic Image" };
          }

          const data = { inputs: text };
          const response = await query(data);

          if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            return { imageUrl, annotation: annotationPanelText[index] };
          } else {
            console.error(`Error for Panel ${index + 1}: ${response.statusText}`);
            return { imageUrl: null, annotation: `Error: ${response.statusText}` };
          }
        })
      );

      setComicImages(allImages);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComicGenerator = () => {
    setComicText(Array(10).fill(''));
    setAnnotationPanelText(Array(10).fill(''));
    setComicImages(Array(10).fill(null));
  };

  const query = async (data) => {
    try {
      const response = await fetch(
        API_URL,
        {
          headers: {
            "Accept": "image/png",
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error in query function:', error.message);
      throw error;
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Comic Generator</h1>
      </header>
      <form onSubmit={(e) => e.preventDefault()}>
         {comicText.map((text, index) => (
                <div key={index} className="panel">
                  <label>{`Panel ${index + 1}: `}</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="text-input"
                  />
                  <label>Annotation for {`Panel ${index + 1}: `}</label>
                  <input
                    type="text"
                    onChange={(e) =>
                      handleAnnotationChange(index, e.target.value)
                    }
                    className="text-input"
                  />
                </div>
              ))}
              <div className='btns'>
        <button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating........' : 'Generate Comic'}
        </button>
        <button type="button" onClick={handleComicGenerator}>
           Clear
        </button>
        </div>
      </form>
      {loading && <div className="loader"></div>}
      <div className="comic-display">
        {comicImages.map((panel, index) => (
          panel && (
            <div key={index} className="comic-panel">
              {panel.imageUrl ? (
                <img src={panel.imageUrl} alt={`Create more ${index + 1}`} />
              ) : (
                <div className="default-text">{panel.annotation}</div>
              )}
              <div className="annotation">{panel.annotation}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default App;

