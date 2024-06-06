import { Meteor } from "meteor/meteor";
import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema';
import _ from "lodash";

import Sceneries from "../../sceneries/both/class.js";
import Simulations from "../../simulations/both/class.js";

const Videos = new FilesCollection({
  collectionName: "videos",
  storagePath: Meteor.settings.s3Path,
  downloadRoute: "/videos",
  protected: function(fileObj) {
    const scenery = Sceneries.findOne(fileObj.meta.owner);

    const simulationId = scenery.owner;
    const simulation = Simulations.findOne(simulationId);

    const userId = this.params.query.xmtok;

    return userId === simulation.owner;
  },
  disableUpload: true
});

Videos.schema = new SimpleSchema(_.extend(
  FilesCollection.schema,
  {
    "meta.owner": {
      type: String,
      label: "Scenery owner",
      regEx: SimpleSchema.RegEx.Id,
      denyUpdate: true
    },
    "meta.notes": {
      type: String,
      label: "Notes",
      optional: true,
      max: 300
    },
    "meta.state": {
      type: String,
      label: "State",
      optional: true
    },
    "meta.error": {
      type: Object,
      label: "Error",
      optional: true,
      blackbox: true
    },
    "meta.createdAt": {
      type: Date,
      label: "Created at",
      optional: true,
      autoValue: function() {
        if (this.isInsert)
          return new Date();

        else if (this.isUpsert)
          return { $setOnInsert: new Date() };

        else
          this.unset();
      }
    }
  }
));

Videos.schema.messageBox.messages({});

Videos.collection.attachSchema(Videos.schema);

Meteor.isServer && Videos.collection.rawCollection().createIndex({ "meta.owner": 1 }, { background: true })

export default Videos;