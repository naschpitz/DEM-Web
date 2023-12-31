import { Mongo } from "meteor/mongo";
import JoSk from "josk";

const Josk = new Mongo.Collection("josk")

import calibrationTask from "../../calibrations/server/tasks"
import simulationTask from "../../simulations/server/tasks"

const db = Josk.rawDatabase()
const job = new JoSk({ db: db, onError: (error) => console.log(error) })

job.setImmediate(calibrationTask, "calibrationTask")

// Delay in milliseconds
job.setInterval(simulationTask, 10 * 1000, "simulationTask")