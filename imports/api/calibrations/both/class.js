import _ from 'lodash';

import CalibrationsDAO from './dao.js';

export default class Calibrations extends CalibrationsDAO {
    static create(simulationId) {
        CalibrationsDAO.insert({simulation: simulationId});
    }

    static setState(calibrationId, state) {
        const calibration = {
            _id: calibrationId,
            state: state
        };

        CalibrationsDAO.updateObj(calibration);
    }

    static usesServer(serverId) {
      const calibrationFound = CalibrationsDAO.findOne({server: serverId, state: {$in: ['paused', 'running']}});

      return !!calibrationFound;
    }

    static removeServer(serverId) {
        CalibrationsDAO.update(
            {
                server: serverId,
                state: {$nin: ['paused', 'running']}
            },
            {
                $unset: {
                    server: ""
                }
            }
        );
    }
}