import FilesDAO from "./dao"

export default class Files extends FilesDAO {
  static async setState(fileId, state, error) {
    const file = {
      _id: fileId,
      state: state,
      error: error,
    }

    await FilesDAO.updateObjAsync(file)
  }

  static async removeByOwner(sceneryId) {
    await FilesDAO.removeAsync({ owner: sceneryId })
  }
}
