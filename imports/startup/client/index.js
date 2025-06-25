import "./accounts.js"

import moment from "moment"
import "moment/locale/de.js"
import "moment/locale/es.js"
import "moment/locale/fr.js"
import "moment/locale/pt.js"

import getLanguage from "../../api/utils/getLanguage"

moment.locale(getLanguage())
