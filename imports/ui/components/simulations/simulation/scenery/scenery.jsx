import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import getErrorMessage from "../../../../../api/utils/getErrorMessage.js"
import SceneriesClass from "../../../../../api/sceneries/both/class.js"

import { FaPlus } from "react-icons/fa"
import Alert from "../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

import Charts from "./charts/charts.jsx"
import Materials from "./materials/materials.jsx"
import NonSolidObjects from "./nonSolidObjects/nonSolidObjects.jsx"
import SolidObjects from "./solidObjects/solidObjects.jsx"
import Storage from "./storage/storage.jsx"
import Viewer from "./viewer/viewer.jsx"

import "./scenery.css"

export default props => {
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false)
  const [isCreatingNSO, setIsCreatingNSO] = useState(false)
  const [isCreatingSO, setIsCreatingSO] = useState(false)
  const [isSceneryReady, setIsSceneryReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("sceneries.byOwner", props.simulationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSceneryReady(true),
    })
  }, [props.simulationId])

  const scenery = useTracker(() => {
    return SceneriesClass.findOne({ owner: props.simulationId })
  })

  function onEvent(event, name, value) {
    const newScenery = _.cloneDeep(scenery)

    _.set(newScenery, name, value)

    Meteor.callAsync("sceneries.update", newScenery).catch(error => {
      Alert.error("Error saving scenery: " + error.reason)
    })
  }

  function onCreateNSODone(result) {
    if (!result) return

    setIsCreatingNSO(true)

    Meteor.callAsync("nonSolidObjects.create", scenery._id)
      .then(() => {
        Alert.success("Non-solid object successfully created.")
      })
      .catch(error => {
        Alert.error("Error creating non-solid object: " + error.reason)
      })
      .finally(() => {
        setIsCreatingNSO(false)
      })
  }

  function onCreateSODone(result) {
    if (!result) return

    setIsCreatingSO(true)

    Meteor.callAsync("solidObjects.create", scenery._id)
      .then(() => {
        Alert.success("Solid object successfully created.")
      })
      .catch(error => {
        Alert.error("Error creating solid object: " + error.reason)
      })
      .finally(() => {
        setIsCreatingSO(false)
      })
  }

  function onCreateMaterialDone(result) {
    if (!result) return

    setIsCreatingMaterial(true)

    Meteor.callAsync("materials.create", scenery._id)
      .then(() => {
        Alert.success("Material successfully created.")
      })
      .catch(error => {
        Alert.error("Error creating material: " + error.reason)
      })
      .finally(() => {
        setIsCreatingMaterial(false)
      })
  }

  const sceneryId = _.get(scenery, "_id")

  if (isSceneryReady) {
    return (
      <div id="scenery">
        <div className="row">
          <div className="col-sm-12 col-md-12 col-lg-2">
            <div className="card">
              <div className="card-header">Storage</div>

              <div className="card-body">
                <Storage scenery={scenery} />
              </div>
            </div>

            <div className="card" id="gravity">
              <div className="card-header">Gravity</div>

              <div className="card-body">
                <FormInput
                  label="Gx"
                  name="gravity[0]"
                  value={_.get(scenery, "gravity[0]")}
                  type="field"
                  subtype="number"
                  size="small"
                  labelSizes={{ xs: 12, sm: 5, md: 4, lg: 3 }}
                  inputSizes={{ xs: 12, sm: 7, md: 8, lg: 9 }}
                  onEvent={onEvent}
                />

                <FormInput
                  label="Gy"
                  name="gravity[1]"
                  value={_.get(scenery, "gravity[1]")}
                  type="field"
                  subtype="number"
                  size="small"
                  labelSizes={{ xs: 12, sm: 5, md: 4, lg: 3 }}
                  inputSizes={{ xs: 12, sm: 7, md: 8, lg: 9 }}
                  onEvent={onEvent}
                />

                <FormInput
                  label="Gz"
                  name="gravity[2]"
                  value={_.get(scenery, "gravity[2]")}
                  type="field"
                  subtype="number"
                  size="small"
                  labelSizes={{ xs: 12, sm: 5, md: 4, lg: 3 }}
                  inputSizes={{ xs: 12, sm: 7, md: 8, lg: 9 }}
                  onEvent={onEvent}
                />
              </div>
            </div>
          </div>

          <div className="col-sm-12 col-md-12 col-lg-5">
            <div className="card" id="nonSolidObjects">
              <div className="card-header d-flex align-items-center">
                <div>Non-Solid Objects</div>
                <div className="ml-auto">
                  <ButtonEnhanced
                    buttonOptions={{
                      regularText: <FaPlus className="align-middle" />,
                      className: "btn btn-sm btn-success",
                      isAction: isCreatingNSO,
                      actionText: "Creating...",
                      type: "button",
                    }}
                    confirmationOptions={{
                      title: "Confirm non-solid object creation",
                      text: <span>Do you really want to create a new non-solid object?</span>,
                      confirmButtonText: "Create",
                      confirmButtonAction: "Creating...",
                      cancelButtonText: "Cancel",
                      onDone: onCreateNSODone,
                    }}
                  />
                </div>
              </div>

              <div className="card-body">
                <NonSolidObjects sceneryId={sceneryId} />
              </div>
            </div>
          </div>

          <div className="col-sm-12 col-md-12 col-lg-5">
            <div className="card" id="solidObjects">
              <div className="card-header d-flex align-items-center">
                <div>Solid Objects</div>
                <div className="ml-auto">
                  <ButtonEnhanced
                    buttonOptions={{
                      regularText: <FaPlus className="align-middle" />,
                      className: "btn btn-sm btn-success",
                      isAction: isCreatingSO,
                      actionText: "Creating...",
                      type: "button",
                    }}
                    confirmationOptions={{
                      title: "Confirm solid object creation",
                      text: <span>Do you really want to create a new solid object?</span>,
                      confirmButtonText: "Create",
                      confirmButtonAction: "Creating...",
                      cancelButtonText: "Cancel",
                      onDone: onCreateSODone,
                    }}
                  />
                </div>
              </div>

              <div className="card-body">
                <SolidObjects sceneryId={sceneryId} />
              </div>
            </div>
          </div>
        </div>

        <div className="card" id="materials">
          <div className="card-header d-flex align-items-center">
            <div>Materials</div>
            <div className="ml-auto">
              <ButtonEnhanced
                buttonOptions={{
                  regularText: <FaPlus className="align-middle" />,
                  className: "btn btn-sm btn-success",
                  isAction: isCreatingMaterial,
                  actionText: "Creating...",
                  type: "button",
                }}
                confirmationOptions={{
                  title: "Confirm material creation",
                  text: <span>Do you really want to create a new material?</span>,
                  confirmButtonText: "Create",
                  confirmButtonAction: "Creating...",
                  cancelButtonText: "Cancel",
                  onDone: onCreateMaterialDone,
                }}
              />
            </div>
          </div>

          <div className="card-body">
            <Materials sceneryId={sceneryId} />
          </div>
        </div>

        {props.showViewer ? (
          <div className="card">
            <div className="card-header">Viewer</div>

            <div className="card-body">
              <Viewer sceneryId={sceneryId} />
            </div>
          </div>
        ) : null}

        <div className="card">
          <div className="card-header">Charts</div>

          <div className="card-body">
            <Charts sceneryId={sceneryId} />
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="container-fluid text-center" id="scenery">
        <div className="spinner-border" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="sr-only">Loading scenery...</span>
        </div>
      </div>
    )
  }
}
