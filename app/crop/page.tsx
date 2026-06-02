"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CropPage() {
  const [status, setStatus] = useState<string>("Loading original logo...");
  const [success, setSuccess] = useState<boolean>(false);
  const [originalSrc, setOriginalSrc] = useState<string>("/logo.png");
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const img = new Image();
    // Prevent caching to get fresh logo
    img.src = "/logo.png?t=" + Date.now();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setStatus("Processing image...");
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setStatus("Failed to get 2D context");
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        let minX = img.width;
        let minY = img.height;
        let maxX = 0;
        let maxY = 0;
        let found = false;

        // Scan pixels for non-white/non-transparent boundary
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const idx = (y * img.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            // Check if pixel is not white (R < 248, G < 248, B < 248) and not transparent (A > 10)
            const isWhite = r > 248 && g > 248 && b > 248;
            const isTransparent = a < 10;

            if (!isWhite && !isTransparent) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              found = true;
            }
          }
        }

        if (!found) {
          setStatus("No non-white logo found in image! Using full image.");
          minX = 0;
          minY = 0;
          maxX = img.width;
          maxY = img.height;
        }

        // Add padding around the cropped circular badge to prevent cutoff of outer stroke
        const padding = 6;
        const cropWidth = maxX - minX;
        const cropHeight = maxY - minY;
        
        // Make it a perfect square
        const baseSize = Math.max(cropWidth, cropHeight);
        const size = baseSize + padding * 2;

        const cropCanvas = canvasRef.current || document.createElement("canvas");
        cropCanvas.width = size;
        cropCanvas.height = size;
        const cropCtx = cropCanvas.getContext("2d");
        if (!cropCtx) {
          setStatus("Failed to create crop context");
          return;
        }

        // 1. Clear canvas
        cropCtx.clearRect(0, 0, size, size);

        // 2. Draw white background inside the circle (so the white parts of the logo stay white)
        cropCtx.beginPath();
        cropCtx.arc(size / 2, size / 2, (size / 2) - 1, 0, Math.PI * 2);
        cropCtx.fillStyle = "#ffffff";
        cropCtx.fill();

        // 3. Create circular clip with smooth antialiased edges
        cropCtx.beginPath();
        cropCtx.arc(size / 2, size / 2, (size / 2) - 1, 0, Math.PI * 2);
        cropCtx.clip();

        // 4. Center and draw the cropped logo
        const dx = padding + (baseSize - cropWidth) / 2;
        const dy = padding + (baseSize - cropHeight) / 2;

        cropCtx.drawImage(
          img,
          minX,
          minY,
          cropWidth,
          cropHeight,
          dx,
          dy,
          cropWidth,
          cropHeight
        );

        const dataUrl = cropCanvas.toDataURL("image/png");
        setPreviewSrc(dataUrl);
        setStatus("Logo successfully cropped and centered!");
      } catch (err: any) {
        setStatus("Error: " + err.message);
      }
    };

    img.onerror = () => {
      setStatus("Failed to load /logo.png. Please verify file path.");
    };
  }, []);

  const saveLogo = async () => {
    if (!previewSrc) return;
    setStatus("Saving new logo to public/logo.png...");
    try {
      const res = await fetch("/api/save-logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: previewSrc }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setStatus("Logo saved successfully! Reload the app to see it.");
      } else {
        setStatus("Failed to save: " + data.error);
      }
    } catch (err: any) {
      setStatus("Error saving: " + err.message);
    }
  };

  return (
    <div style={{
      maxWidth: 600,
      margin: "40px auto",
      padding: 24,
      background: "var(--white, #fff)",
      borderRadius: 16,
      border: "1px solid var(--navy-border, #ccc)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      fontFamily: "var(--font, sans-serif)",
      textAlign: "center"
    }}>
      <h1 style={{ color: "var(--navy, #1a3a5c)", marginBottom: 12 }}>Auto-Crop Brand Logo</h1>
      <p style={{ color: "var(--text-muted, #666)", marginBottom: 24 }}>
        This page automatically detects the circular logo inside your white-padded <code>logo.png</code>, 
        crops it precisely, adds transparent spacing, and centers it perfectly.
      </p>

      <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
        <div>
          <h3 style={{ marginBottom: 10, color: "var(--navy)" }}>Original Logo</h3>
          <div style={{
            width: 160,
            height: 160,
            border: "1px dashed #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8f9fa",
            borderRadius: 8,
            overflow: "hidden"
          }}>
            <img src={originalSrc} alt="Original Logo" style={{ maxWidth: "100%", maxHeight: "100%" }} />
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 10, color: "var(--navy)" }}>Cropped Preview</h3>
          <div style={{
            width: 160,
            height: 160,
            border: "1px dashed #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            borderRadius: 8,
            overflow: "hidden"
          }}>
            {previewSrc ? (
              <img id="logo-preview-image" src={previewSrc} alt="Cropped Preview" style={{ width: 120, height: 120, borderRadius: "50%", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
            ) : (
              <span style={{ fontSize: 12, color: "#999" }}>Loading...</span>
            )}
          </div>
        </div>
      </div>

      <div style={{
        padding: "12px 16px",
        borderRadius: 8,
        background: success ? "#e6fffa" : "#f0f4f8",
        color: success ? "#319795" : "var(--text-muted)",
        fontWeight: "500",
        marginBottom: 24,
        fontSize: 14
      }}>
        {status}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button 
          id="btn-save-logo"
          onClick={saveLogo} 
          disabled={!previewSrc || success}
          style={{
            background: success ? "#cbd5e0" : "var(--navy, #1a3a5c)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            fontWeight: "bold",
            cursor: previewSrc && !success ? "pointer" : "not-allowed",
            transition: "all 0.2s"
          }}
        >
          {success ? "Saved!" : "Save and Apply Logo"}
        </button>
      </div>
    </div>
  );
}
