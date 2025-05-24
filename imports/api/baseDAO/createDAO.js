import dot from "dot-object";
import _ from "lodash";

// Create a factory function that generates a DAO class for a collection
export default function createDAO(collection) {
  return class BaseDAO {
    static find(...args) {
      return collection.find(...args);
    }

    static findOne(...args) {
      return collection.findOne(...args);
    }

    static insert(...args) {
      return collection.insert(...args);
    }

    static update(...args) {
      return collection.update(...args);
    }

    static upsert(...args) {
      return collection.upsert(...args);
    }

    static remove(...args) {
      return collection.remove(...args);
    }

    static updateObj(obj) {
      dot.keepArray = true
      const dottedObj = dot.dot(obj);

      const set = {};
      const unset = {};

      _.keys(dottedObj).forEach(key => {
        const value = dottedObj[key];
        value != null ? (set[key] = value) : (unset[key] = "");
      });

      return collection.update(obj._id, {
        $set: set,
        $unset: unset,
      });
    }

    static rawCollection() {
      return collection.rawCollection();
    }

    // Add any other common methods here
  };
}