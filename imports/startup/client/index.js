import './accounts.js';

import moment from 'moment';
import 'moment/locale/de.js';
import 'moment/locale/es.js';
import 'moment/locale/fr.js';
import 'moment/locale/pt.js';

moment.locale(getLanguage());

attachTooltip = function() {
    $('[data-toggle="tooltip"]').tooltip();
};

detachTooltip = function() {
    $('[data-toggle="tooltip"]').tooltip('dispose');
};

// https://stackoverflow.com/questions/47945095/react-router-how-to-replace-dynamically-parameters-in-a-string
placeParams = function (pathRegex, params) {
    let segments = pathRegex.split("/");

    return segments.map(segment => {
        let offset = segment.indexOf(":") + 1;
        if (!offset)
            return segment;

        let key = segment.slice(offset);
        key = key.split('?').join('');
        return params[key]
    }).join("/")
};