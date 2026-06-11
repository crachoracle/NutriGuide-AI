import { Camera, FileText, Image, ScanLine, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { getSampleMenu } from "../api/apiClient.js";

export default function MenuUpload({ loading, onAnalyze }) {
  const [mode, setMode] = useState("sample");
  const [uploadedText, setUploadedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileMeta, setFileMeta] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [samplePreview, setSamplePreview] = useState("");

  useEffect(() => {
    getSampleMenu()
      .then((menu) => setSamplePreview(menu.text))
      .catch(() => setSamplePreview(""));
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleTextFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSelectedFile(null);
    const text = await file.text().catch(() => "");
    setUploadedText(text);
    setMode("text");
  }

  function handleMenuFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFileName(file.name);
    setUploadedText("");
    setSelectedFile(file);
    setFileMeta({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      lastModified: file.lastModified
    });
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    setMode("file");
  }

  function submit(event) {
    event.preventDefault();
    onAnalyze({
      useSampleMenu: mode === "sample",
      uploadedText,
      fileName,
      uploadedFile: mode === "file" ? selectedFile : null,
      uploadedFileMeta: mode === "file" ? fileMeta : null
    });
  }

  const canAnalyze =
    mode === "sample" || (mode === "file" && fileMeta) || (mode === "text" && uploadedText.trim());

  return (
    <section className="panel upload-panel">
      <div className="section-heading">
        <span className="eyebrow">Menu source</span>
        <h2>Start with a menu</h2>
      </div>

      <form className="upload-form" onSubmit={submit}>
        <div className="mode-switch" role="tablist" aria-label="Menu source">
          <button
            className={mode === "sample" ? "active" : ""}
            type="button"
            onClick={() => setMode("sample")}
          >
            <FileText size={17} aria-hidden="true" />
            Sample menu
          </button>
          <button
            className={mode === "file" ? "active" : ""}
            type="button"
            onClick={() => setMode("file")}
          >
            <Camera size={17} aria-hidden="true" />
            Photo/PDF
          </button>
          <button
            className={mode === "text" ? "active" : ""}
            type="button"
            onClick={() => setMode("text")}
          >
            <Upload size={17} aria-hidden="true" />
            Paste text
          </button>
        </div>

        {mode === "sample" ? (
          <div className="menu-preview">
            <div className="preview-toolbar">
              <span>Harbor Market Cafe</span>
              <span>15 items</span>
            </div>
            <pre>{samplePreview || "Loading sample menu..."}</pre>
          </div>
        ) : null}

        {mode === "file" ? (
          <div className="photo-upload">
            <div className="capture-actions">
              <input
                id="menu-camera"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleMenuFileChange}
              />
              <label htmlFor="menu-camera">
                <Camera size={21} aria-hidden="true" />
                <span>Take a menu photo</span>
              </label>

              <input
                id="menu-media-file"
                type="file"
                accept="image/*,.pdf,application/pdf"
                onChange={handleMenuFileChange}
              />
              <label htmlFor="menu-media-file">
                <Image size={21} aria-hidden="true" />
                <span>Upload photo or PDF</span>
              </label>
            </div>

            {fileMeta ? (
              <div className="file-summary">
                {previewUrl ? (
                  <img alt="Selected menu preview" src={previewUrl} />
                ) : (
                  <div className="pdf-preview">
                    <FileText size={34} aria-hidden="true" />
                    <span>PDF selected</span>
                  </div>
                )}
                <div>
                  <strong>{fileMeta.name}</strong>
                  <span>
                    {fileMeta.type || "Unknown file type"} - {Math.ceil(fileMeta.size / 1024)} KB
                  </span>
                  <p>
                    Mock OCR will process this upload and return demo extracted menu text.
                  </p>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                Select a camera photo, image, or PDF menu to run the mock OCR analysis.
              </div>
            )}
          </div>
        ) : null}

        {mode === "text" ? (
          <div className="upload-drop">
            <input id="menu-file" type="file" accept=".txt,.md,.csv" onChange={handleTextFileChange} />
            <label htmlFor="menu-file">
              <Upload size={21} aria-hidden="true" />
              <span>{fileName || "Choose a menu text file"}</span>
            </label>
            <textarea
              placeholder="Or paste menu text here..."
              value={uploadedText}
              onChange={(event) => setUploadedText(event.target.value)}
            />
          </div>
        ) : null}

        <button className="primary-action" disabled={loading || !canAnalyze} type="submit">
          <ScanLine size={18} aria-hidden="true" />
          {loading ? "Analyzing..." : "Analyze Menu"}
        </button>
      </form>
    </section>
  );
}
