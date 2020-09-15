import SimulationsLogsCol from './collection.js';

export default class SimulationsLogsDAO {
    static find(...args) {return SimulationsLogsCol.find(...args)}
    static findOne(...args) {return SimulationsLogsCol.findOne(...args)}
    static insert(...args) {return SimulationsLogsCol.insert(...args)}
    static update(...args) {return SimulationsLogsCol.update(...args)}
    static upsert(...args) {return SimulationsLogsCol.upsert(...args)}
    static remove(...args) {return SimulationsLogsCol.remove(...args)}
}