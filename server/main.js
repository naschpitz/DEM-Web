import { Meteor } from "meteor/meteor"

import "../imports/startup/both"
import "../imports/startup/server"

import "./migrations"

Meteor.startup(() => {
  Migrations.migrateTo("latest")
})
