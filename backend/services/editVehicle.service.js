const editVehicleRepository =
    require("../repositories/editVehicle.repository");


// ======================================================
// GET
// ======================================================

const getVehicleById = async (
    carId
) => {

    return await editVehicleRepository
        .getVehicleById(
            carId
        );

};


// ======================================================
// UPDATE
// ======================================================

const updateVehicle = async (
    carId,
    vehicle
) => {

    return await editVehicleRepository
        .updateVehicle(

            carId,

            vehicle

        );

};


module.exports = {

    getVehicleById,

    updateVehicle

};