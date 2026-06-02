"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Added Image import
import { NativeBiometric } from "@capgo/capacitor-native-biometric";

// Simple Fingerprint SVG Icon
// Cleaner, standard Biometric Fingerprint Icon
function FingerprintIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
      <path d="M17.29 21.02c.12-.38.24-.78.36-1.18"/>
      <path d="M2 12c0-5.52 4.48-10 10-10s10 4.48 10 10"/>
      <path d="M5.46 17.53C4.55 16.03 4 14.1 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.1-.55 4.03-1.46 5.53"/>
      <path d="M8.5 15.5c-.32-.97-.5-2.01-.5-3.08 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.07-.18 2.11-.5 3.08"/>
    </svg>
  );
}

export default function PinLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [hasBiometric, setHasBiometric] = useState(false);
  const router = useRouter();

  // 1. Check if the device has a fingerprint scanner available
// 1. Check for biometrics and AUTO-PROMPT if available
  useEffect(() => {
    const checkAndPromptBiometrics = async () => {
      try {
        const result = await NativeBiometric.isAvailable();
        
        if (result.isAvailable) {
          setHasBiometric(true);
          
          // Attempt to auto-login immediately
          try {
            const credentials = await NativeBiometric.getCredentials({
              server: "ssga",
            });

            // If credentials exist, submit them automatically
            if (credentials && credentials.password) {
              submitPin(credentials.password);
            }
          } catch (err) {
            // Fails silently if they haven't logged in with a PIN for the first time yet,
            // or if they tap "Cancel" on the native dark window.
            // They just remain on the keypad.
            console.log("No saved credentials yet, or user cancelled.");
          }
        }
      } catch (err) {
        console.log("Biometrics not available on this device.");
      }
    };
    
    checkAndPromptBiometrics();
  }, []);

  // Auto-submit when 6 digits are reached
  useEffect(() => {
    if (pin.length === 6) {
      submitPin();
    }
  }, [pin]);

  // 2. Main Login Function
  const submitPin = async (pinToSubmit = pin) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinToSubmit }),
    });

    if (res.ok) {
      if (hasBiometric) {
        try {
          await NativeBiometric.setCredentials({
            username: "admin",
            password: pinToSubmit,
            server: "ssga",
          });
        } catch (e) {
          console.error("Could not save biometric credentials", e);
        }
      }

      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  };

  // 3. Handle Fingerprint Scan
  const handleBiometricScan = async () => {
    try {
      const credentials = await NativeBiometric.getCredentials({
        server: "ssga",
      });

      if (credentials && credentials.password) {
        submitPin(credentials.password);
      }
    } catch (err) {
      setError("Fingerprint not recognized or not set up yet. Enter PIN manually.");
    }
  };

  const handleBackspace = () => {
    setError("");
    setPin((prev) => prev.slice(0, -1));
  };

  const handlePress = (num: string) => {
    if (pin.length >= 6) return;
    setError("");
    setPin((prev) => prev + num);
  };

  return (
    <div className="pin-container">
      <div className="pin-header">
        {/* Added Logo Here */}
        <div className="pin-logo-wrapper">
          <Image 
            src="/logo.png" 
            alt="Shri Shyam Gas Agency" 
            width={70} 
            height={70} 
            className="pin-logo"
            priority 
          />
        </div>
        <h1>Enter Security PIN</h1>
        <p>Please enter your 6-digit PIN to continue</p>
      </div>

      <div className="pin-dots">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`pin-dot ${i < pin.length ? "filled" : ""}`} />
        ))}
      </div>

      {error && <p className="pin-error">{error}</p>}

      <div className="pin-numpad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button key={num} onClick={() => handlePress(num)} className="pin-key">
            {num}
          </button>
        ))}

        {hasBiometric ? (
          <button onClick={handleBiometricScan} className="pin-key action-key" style={{ color: "var(--primary)" }}>
            <FingerprintIcon />
          </button>
        ) : (
          <div /> 
        )}

        <button onClick={() => handlePress("0")} className="pin-key">
          0
        </button>
        
        <button onClick={handleBackspace} className="pin-key action-key">
          ⌫
        </button>
      </div>
    </div>
  );
}