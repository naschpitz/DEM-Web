import React from "react"
import { Link } from "react-router-dom"
import useScreenSize from "../screenSize/useScreenSize"

import "./footer.css"

export default () => {
  const screenSize = useScreenSize()

  function renderText() {
    if (screenSize === "xs")
      return (
        <p className="text-muted text-center">
          DEM.naschpitz.com 2020 || <Link to={"/disclaimer"}>Disclaimer</Link> ||{" "}
          <Link to={"/privacy"}>Privacy Policy</Link> || <Link to={"/terms"}>Terms</Link>
        </p>
      )

    return (
      <p className="text-muted text-center">
        DEM.naschpitz.com 2020 || <Link to={"/disclaimer"}>Disclaimer</Link> ||{" "}
        <Link to={"/privacy"}>Privacy Policy</Link> || <Link to={"/terms"}>Terms</Link> || contact@naschpitz.com
      </p>
    )
  }

  return (
    <footer className="footer">
      <div className="container">{renderText()}</div>
    </footer>
  )
}
