import MaterialsDAO from './dao.js';
import NonSolidObjects from '../../nonSolidObjects/both/class.js';
import SolidObjects from '../../solidObjects/both/class.js';

export default class Materials extends MaterialsDAO {
    static create(owner) {
        return this.insert({owner: owner});
    }

    static usesMaterial(materialId) {
        const materialFound = MaterialsDAO.findOne({$or: [{material1: materialId}, {material2: materialId}]});

        return !!materialFound;
    }

    static remove(materialId) {
        const nsoResult = NonSolidObjects.usesMaterial(materialId);
        if (nsoResult) throw {message: "Cannot remove material, a Non-Solid Object makes reference to it."};

        const soResult = SolidObjects.usesMaterial(materialId);
        if (soResult) throw {message: "Cannot remove material, a Solid Object makes reference to it."};

        const materialResult = this.usesMaterial(materialId);
        if (materialResult) throw {message: "Cannot remove material, another Material makes reference to it."};

        MaterialsDAO.remove(materialId);
    }

    static removeByOwner(sceneryId) {
        MaterialsDAO.remove({owner: sceneryId});
    }
}