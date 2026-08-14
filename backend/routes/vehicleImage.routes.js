const express =
    require("express");

const router =
    express.Router();


const vehicleImageController =
    require("../controllers/vehicleImage.controller");


const upload =
    require("../middlewares/upload.middleware");


// ======================================================
// UPLOAD VEHICLE IMAGES
// ======================================================
//
// POST
// /api/admin/vehicles/:carId/images
//
// ======================================================

router.post(

    "/:carId/images",

    upload.array(
        "images",
        10
    ),

    vehicleImageController
        .uploadVehicleImages

);


// ======================================================
// GET VEHICLE IMAGES
// ======================================================
//
// GET
// /api/admin/vehicles/:carId/images
//
// ======================================================

router.get(

    "/:carId/images",

    vehicleImageController
        .getVehicleImages

);


// ======================================================
// EXPORT
// ======================================================

module.exports =
    router;