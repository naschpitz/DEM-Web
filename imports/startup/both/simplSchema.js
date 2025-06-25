import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

SimpleSchema.extendOptions(["index", "unique", "denyInsert", "denyUpdate"])
