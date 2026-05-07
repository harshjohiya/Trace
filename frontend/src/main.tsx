import React from "react"
import ReactDOM from "react-dom/client"
import { Toaster } from "react-hot-toast"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            border: "1px solid #e8e8f0",
            background: "#fff",
            color: "#0f0f1a",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
