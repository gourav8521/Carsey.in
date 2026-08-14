const editVehicleService =
    require("../services/editVehicle.service");


// ======================================================
// GET SINGLE VEHICLE
// ======================================================

const getVehicleById = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        if (!carId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        const result =
            await editVehicleService
                .getVehicleById(
                    carId
                );


        if (!result) {

            return res.status(404).json({

                success: false,

                message:
                    "Vehicle not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Vehicle fetched successfully.",

            data: result

        });

    } catch (error) {

        console.error(
            "Get Vehicle By ID Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load vehicle."

        });

    }

};


// ======================================================
// UPDATE VEHICLE
// ======================================================

const updateVehicle = async (
    req,
    res
) => {

    try {

        const carId =
            Number(
                req.params.carId
            );


        if (!carId) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid vehicle ID is required."

            });

        }


        const result =
            await editVehicleService
                .updateVehicle(

                    carId,

                    req.body

                );


        return res.status(200).json({

            success: true,

            message:
                "Vehicle updated successfully.",

            data: result

        });

    } catch (error) {

        console.error(
            "Update Vehicle Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to update vehicle."

        });

    }

};


module.exports = {

    getVehicleById,

    updateVehicle

};