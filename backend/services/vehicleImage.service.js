const vehicleImageRepository =
    require("../repositories/vehicleImage.repository");


// ======================================================
// ADD IMAGE
// ======================================================

const addVehicleImage = async (
    carId,
    imageType,
    imagePath,
    isPrimary
) => {

    return await vehicleImageRepository
        .addVehicleImage(
            carId,
            imageType,
            imagePath,
            isPrimary
        );

};


// ======================================================
// GET IMAGES
// ======================================================

const getVehicleImages = async (
    carId
) => {

    return await vehicleImageRepository
        .getVehicleImages(
            carId
        );

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicleImage,

    getVehicleImages

};