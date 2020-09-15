import _ from 'lodash';

class EventsManager {
    constructor() {
        this.map = [];
    }

    connect(signal, slot) {
        this.map.push({
            signal: signal,
            slot: slot
        });
    }

    disconnect(element) {
        if (typeof element === 'function')
            _.remove(this.map, pair => pair.slot === element);

        else
            _.remove(this.map, pair => pair.signal === element);
    }

    emit(signal, ...args) {
        const filteredMap = _.filter(this.map, {signal: signal});

        filteredMap.forEach(pair => pair.slot(...args));
    }
}

export default eventsManager = new EventsManager();