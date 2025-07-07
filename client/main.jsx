import React from "react"
import { Meteor } from "meteor/meteor"
import { createRoot } from "react-dom/client"

import { BrowserRouter } from "react-router-dom"

// Will load Bootstrap's *.js.
import "bootstrap"

// Will load Bootstrap's styles.
import "bootstrap/dist/css/bootstrap.css"

import "@naschpitz/button-enhanced/dist/index.css"
import "@naschpitz/form-input/dist/index.css"
import "@naschpitz/unique-modal/dist/index.css"

import "../imports/startup/both"
import "../imports/startup/client"

import App from "../imports/ui/layouts/main/main"

Meteor.startup(() => {
  const domNode = document.getElementById("render-target")
  const root = createRoot(domNode)

  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
})
