const vehicleImageService =
    require("../services/vehicleImage.service");


// ======================================================
// UPLOAD VEHICLE IMAGES
// ======================================================

const uploadVehicleImages = async (
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


        if (
            !req.files ||
            req.files.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please select at least one image."

            });

        }


        // ==================================================
        // IMAGE TYPES
        // ==================================================

        const imageTypes = [

            "Front",

            "Back",

            "Left",

            "Right",

            "Interior",

            "Engine",

            "Dashboard",

            "Documents",

            "Other"

        ];


        const uploadedImages = [];


        // ==================================================
        // SAVE EACH IMAGE
        // ==================================================

        for (
            let index = 0;
            index < req.files.length;
            index++
        ) {

            const file =
                req.files[index];


            const imageType =
                req.body[
                    `imageType_${index}`
                ] ||
                imageTypes[index] ||
                "Other";


            const safeImageType =
                imageTypes.includes(
                    imageType
                )
                    ? imageType
                    : "Other";


            const imagePath =
                `/uploads/vehicles/${file.filename}`;


            const isPrimary =
                index === 0;


            const imageId =
                await vehicleImageService
                    .addVehicleImage(

                        carId,

                        safeImageType,

                        imagePath,

                        isPrimary

                    );


            uploadedImages.push({

                imageId,

                carId,

                imageType:
                    safeImageType,

                imagePath,

                isPrimary

            });

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Vehicle images uploaded successfully.",

            data: {

                carId,

                images:
                    uploadedImages

            }

        });

    } catch (error) {

        console.error(
            "Upload Vehicle Images Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to upload vehicle images."

        });

    }

};


// ======================================================
// GET VEHICLE IMAGES
// ======================================================

const getVehicleImages = async (
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


        const images =
            await vehicleImageService
                .getVehicleImages(
                    carId
                );


        return res.status(200).json({

            success: true,

            message:
                "Vehicle images fetched successfully.",

            data: {

                images

            }

        });

    } catch (error) {

        console.error(
            "Get Vehicle Images Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to fetch vehicle images."

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    uploadVehicleImages,

    getVehicleImages

};