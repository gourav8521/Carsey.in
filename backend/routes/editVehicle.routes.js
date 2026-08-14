const express =
    require("express");

const router =
    express.Router();

const controller =
    require("../controllers/editVehicle.controller");


// ======================================================
// GET SINGLE VEHICLE
// ======================================================

router.get(

    "/:carId",

    controller.getVehicleById

);


// ======================================================
// UPDATE VEHICLE
// ======================================================

router.put(

    "/:carId",

    controller.updateVehicle

);


module.exports =
    router;