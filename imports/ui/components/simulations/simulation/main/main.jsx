import React from "react"

import Log from "../log/log.jsx"
import Notes from "../notes/notes"
import Scenery from "../scenery/scenery.jsx"
import SimulationControl from "../../simulationControl/simulationControl.jsx"

import "./main.css"

export default Main = props => {
  const simulationId = props.simulationId

  // If the simulation is primary, show the viewer.
  // This is because simulations ran during calibrations, which are not primary, do not have data about the position
  // of each particle or face, so the viewer is not shown.
  const showViewer = props.primary

  return (
    <div id="main">
      <div className="card">
        <div className="card-header">
          Control
        </div>

        <div className="card-body">
          <SimulationControl simulationId={simulationId} showFields={true} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Log
        </div>

        <div className="card-body">
          <Log type="simulation" id={simulationId} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Notes
        </div>

        <div className="card-body">
          <Notes simulationId={simulationId} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Scenery
        </div>

        <div className="card-body">
          <Scenery simulationId={simulationId} showViewer={showViewer} />
        </div>
      </div>
    </div>
  )
}
