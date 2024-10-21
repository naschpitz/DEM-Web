import { Mongo } from "meteor/mongo";
import JoSk from "josk";

const Josk = new Mongo.Collection("josk")

import restartCalibrationsTask from "../../calibrations/server/task/restartCalibrations"
import checkStalledSimulationsTask from "../../simulations/server/tasks/checkStalledSimulations"

const db = Josk.rawDatabase()
const job = new JoSk({ db: db, onError: (error) => console.log(error) })

job.setImmediate(restartCalibrationsTask, "calibrationTask")

// Delay in milliseconds
job.setInterval(checkStalledSimulationsTask, 10 * 1000, "simulationTask")