import React, { useState, useEffect } from "react";
import "./Toast.css";

const toastEvents = {
  listeners: [],
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },
  emit(toast) {
    this.listeners.forEach((listener) => listener(toast));
  },
};

export const toast = {
  success(message, duration = 3000) {
    toastEvents.emit({ type: "success", message, duration, id: Date.now() + Math.random() });
  },
  error(message, duration = 4000) {
    toastEvents.emit({ type: "error", message, duration, id: Date.now() + Math.random() });
  },
  info(message, duration = 3000) {
    toastEvents.emit({ type: "info", message, duration, id: Date.now() + Math.random() });
  },
  warning(message, duration = 3500) {
    toastEvents.emit({ type: "warning", message, duration, id: Date.now() + Math.random() });
  },
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toastEvents.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration);
    });
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} animate-slide-in`}>
          <div className="toast-icon">
            {t.type === "success" && "✓"}
            {t.type === "error" && "✗"}
            {t.type === "info" && "ℹ"}
            {t.type === "warning" && "⚠"}
          </div>
          <div className="toast-message">{t.message}</div>
        </div>
      ))}
    </div>
  );
};
