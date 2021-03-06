import { Random } from 'meteor/random';
import _ from 'lodash';

import MaterialsDAO from './dao.js';
import NonSolidObjects from '../../nonSolidObjects/both/class.js';
import SolidObjects from '../../solidObjects/both/class.js';

export default class Materials extends MaterialsDAO {
    static clone(oldSceneryId, newSceneryId) {
        const oldMaterials = MaterialsDAO.find({owner: oldSceneryId});

        const materialsMap = new Map();

        oldMaterials.forEach((oldMaterial) => {
            const oldMaterialId = oldMaterial._id;
            const newMaterialId = Random.id();

            materialsMap.set(oldMaterialId, newMaterialId);
        });

        oldMaterials.forEach((oldMaterial) => {
            const newMaterial = _.clone(oldMaterial);
            newMaterial._id = materialsMap.get(oldMaterial._id);
            newMaterial.owner = newSceneryId;
            newMaterial.material1 = materialsMap.get(oldMaterial.material1);
            newMaterial.material2 = materialsMap.get(oldMaterial.material2);

            MaterialsDAO.insert(newMaterial);
        });

        return materialsMap;
    }

    static create(owner) {
        return MaterialsDAO.insert({owner: owner});
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