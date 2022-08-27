import "./accounts.js"

import "../../api/calibrations/server/methods.js"
import "../../api/calibrations/server/publications.js"

import "../../api/cameras/server/publications.js"

import "../../api/dataSets/server/publications.js"

import "../../api/frames/server/methods.js"
import "../../api/frames/server/publications.js"

import "../../api/framesImages/server/methods.js"

import "../../api/materials/server/publications.js"

import "../../api/nonSolidObjects/server/publications.js"

import "../../api/objectsProperties/server/publications.js"

import "../../api/rest/server/rest.js"

import "../../api/sceneries/server/methods.js"
import "../../api/sceneries/server/publications.js"

import "../../api/servers/server/publications.js"

import "../../api/simulations/server/methods.js"
import "../../api/simulations/server/publications.js"

import "../../api/simulationsLogs/server/publications.js"

import "../../api/solidObjects/server/publications.js"

import "../../api/users/server/methods.js"

import "../../api/videos/server/methods.js"
import "../../api/videos/server/publications.js"

//====================================================================================================================//

import CamerasCol from "../../api/cameras/both/collection.js"
import FramesCol from "../../api/frames/both/collection.js"
import MaterialsCol from "../../api/materials/both/collection.js"
import NonSolidObjectsCol from "../../api/nonSolidObjects/both/collection.js"
import ObjectsPropertiesCol from "../../api/objectsProperties/both/collection.js"
import SceneriesCol from "../../api/sceneries/both/collection.js"
import ServersCol from "../../api/servers/both/collection.js"
import SimulationsCol from "../../api/simulations/both/collection.js"
import SimulationsLogsCol from "../../api/simulationsLogs/both/collection.js"
import SolidObjectsCol from "../../api/solidObjects/both/collection.js"
import VideosCol from "../../api/videos/both/collection.js"

CamerasCol.rawCollection().createIndex({ owner: 1 }, { background: true })
CamerasCol.rawCollection().createIndex({ owner: 1 }, { background: true })
FramesCol.rawCollection().createIndex({ owner: 1 }, { background: true })
MaterialsCol.rawCollection().createIndex({ owner: 1 }, { background: true })
NonSolidObjectsCol.rawCollection().createIndex({ owner: 1 }, { background: true })
ObjectsPropertiesCol.rawCollection().createIndex({ owner: 1 }, { background: true })
SceneriesCol.rawCollection().createIndex({ owner: 1 }, { background: true })
ServersCol.rawCollection().createIndex({ owner: 1 }, { background: true })
SimulationsCol.rawCollection().createIndex({ owner: 1 }, { background: true })
SimulationsLogsCol.rawCollection().createIndex({ owner: 1 }, { background: true })
SolidObjectsCol.rawCollection().createIndex({ owner: 1 }, { background: true })
VideosCol.collection.rawCollection().createIndex({ "meta.owner": 1 }, { background: true })
