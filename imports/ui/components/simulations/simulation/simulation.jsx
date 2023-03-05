import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { Link, useNavigate, useParams } from "react-router-dom"
import _ from "lodash"

import SimulationsClass from "../../../../api/simulations/both/class.js"

import Alert from "react-s-alert-v3"
import ClipLoader from "react-spinners/ClipLoader"

import Calibration from "./calibration/calibration.jsx"
import Main from "./main/main.jsx"

import "./simulation.css"

export default Simulation = props => {
  const [isReady, setIsReady] = useState(false)

  const navigate = useNavigate()
  const params = useParams()

  const simulationId = params.simulationId
  const tab = params.tab

  useEffect(() => {
    if (!tab) navigate("/simulations/" + simulationId + "/main", { replace: true })
  }, [params])

  useTracker(() => {
    Meteor.subscribe("simulations.simulation", simulationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [simulationId])

  const simulation = useTracker(() => {
    return SimulationsClass.findOne(simulationId)
  })

  useEffect(() => {
    if (isReady && !simulation) navigate("/simulations")
  }, [isReady, simulation])

  const MenuLink = ({ tab, label }) => {
    const active = tab === params.tab

    const to = "/simulations/" + simulationId + "/" + tab

    return (
      <li className="nav-item">
        <Link className={"nav-link " + (active ? "active" : "")} to={to} role="tab">
          {label}
        </Link>
      </li>
    )
  }

  function renderPrimary() {
    return (
      <React.Fragment>
        <ul className="nav nav-tabs nav-justified" role="tablist">
          <MenuLink tab="main" label="Main" />
          <MenuLink tab="calibration" label="Calibration" />
        </ul>

        <div className="tab-content">{renderTab()}</div>
      </React.Fragment>
    )

    function renderTab() {
      const tab = params.tab

      switch (tab) {
        case "main":
          return <Main name="main" simulationId={simulationId} primary={true} />
        case "calibration":
          return <Calibration name="calibration" simulationId={simulationId} />
      }
    }
  }

  function renderNonPrimary() {
    return <Main name="main" simulationId={simulationId} primary={false} />
  }

  const name = _.get(simulation, "name")

  if (isReady) {
    return (
      <div className="container-fluid" id="simulation">
        <div>
          <h2 className="text-center">{name}</h2>

          {simulation.primary ? renderPrimary() : renderNonPrimary()}
        </div>
      </div>
    )
  } else {
    return (
      <div className="container-fluid text-center" id="simulation">
        <ClipLoader size={50} color={"#DDD"} loading={true} />
      </div>
    )
  }
}
