import Sceneries from '../../sceneries/both/class.js';
import SimulationsDAO from './dao.js';

export default class Simulations extends SimulationsDAO {
    static create() {
        const simulationId = SimulationsDAO.insert({});

        Sceneries.create(simulationId);
    }

    static setState(simulationId, state) {
        const simulation = {
            _id: simulationId,
            state: state
        };

        SimulationsDAO.updateObj(simulation);
    }

    static usesServer(serverId) {
        const simulationFound = Simulations.findOne({server: serverId, state: {$in: ['paused', 'running']}});

        return !!simulationFound;
    }

    static removeServer(serverId) {
        Simulations.update(
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