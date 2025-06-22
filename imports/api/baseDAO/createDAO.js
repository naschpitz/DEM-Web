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

    static async findOneAsync(...args) {
      return collection.findOneAsync(...args);
    }

    static async insertAsync(...args) {
      return collection.insertAsync(...args);
    }

    static async updateAsync(...args) {
      return collection.updateAsync(...args);
    }

    static async upsertAsync(...args) {
      return collection.upsertAsync(...args);
    }

    static async removeAsync(...args) {
      return collection.removeAsync(...args);
    }

    static async updateObjAsync(obj) {
      dot.keepArray = true
      const dottedObj = dot.dot(obj);

      const set = {};
      const unset = {};

      _.keys(dottedObj).forEach(key => {
        const value = dottedObj[key];
        value != null ? (set[key] = value) : (unset[key] = "");
      });

      return collection.updateAsync(obj._id, {
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