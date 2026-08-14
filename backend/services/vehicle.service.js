const vehicleRepository =
    require("../repositories/vehicle.repository");

const vehicleImageRepository =
    require("../repositories/vehicleImage.repository");

const inspectionReportRepository =
    require("../repositories/inspectionReport.repository");

const inspectionReportPdfService =
    require("./inspectionReportPdf.service");

const emailService =
    require("./email.service");

const env =
    require("../config/env");


// ======================================================
// ADD VEHICLE
// ======================================================

const addVehicle = async (vehicle) => {

    // ==================================================
    // STEP 1
    // SAVE VEHICLE + OWNER + INSPECTION + CHECKLIST
    // ==================================================

    const result =
        await vehicleRepository.addVehicle(
            vehicle
        );


    // ==================================================
    // VALIDATE RESULT
    // ==================================================

    if (!result) {

        throw new Error(
            "Vehicle could not be added."
        );

    }


    const vehicleId =
        Number(result.vehicleId);


    const reportId =
        Number(result.reportId);


    if (
        !Number.isInteger(vehicleId) ||
        vehicleId <= 0
    ) {

        throw new Error(
            "Vehicle ID was not generated."
        );

    }


    if (
        !Number.isInteger(reportId) ||
        reportId <= 0
    ) {

        throw new Error(
            "Inspection report ID was not generated."
        );

    }


    // ==================================================
    // STEP 2
    // ONLY PUBLISHED VEHICLE
    // ==================================================

    const isPublished =
        vehicle.status === "Published";


    // ==================================================
    // DRAFT / OTHER STATUS
    // ==================================================

    if (!isPublished) {

        return {

            ...result,

            pdfGenerated: false,

            adminEmailSent: false,

            message:
                "Vehicle added successfully."

        };

    }


    // ==================================================
    // STEP 3
    // GET COMPLETE SAVED VEHICLE DATA
    // ==================================================

    const vehicleData =
        await vehicleRepository.getVehicleById(
            vehicleId
        );


    if (!vehicleData) {

        throw new Error(
            "Saved vehicle data could not be loaded."
        );

    }


    // ==================================================
    // STEP 4
    // PREPARE COMPLETE PDF DATA
    // ==================================================

    const completeReport = {

        // ----------------------------------------------
        // REPORT
        // ----------------------------------------------

        reportId,

        carId:
            vehicleId,

        overallScore:
            vehicleData.inspection?.overall_score ??
            vehicle.overall_score ??
            0,

        engineRemark:
            vehicleData.inspection?.engine_remark ??
            vehicle.engine_remark ??
            "Not provided.",

        overallRemark:
            vehicleData.inspection?.overall_remark ??
            vehicle.overall_remark ??
            "Vehicle inspection completed.",

        publishStatus:
            "Yes",


        // ----------------------------------------------
        // COMPLETE VEHICLE DATA
        // ----------------------------------------------

        vehicle:
            vehicleData.vehicle || {},


        // ----------------------------------------------
        // COMPLETE OWNER DATA
        // ----------------------------------------------

        owner:
            vehicleData.owner || {},


        // ----------------------------------------------
        // INSPECTION DATA
        // ----------------------------------------------

        inspection:
            vehicleData.inspection || {},


        // ----------------------------------------------
        // CHECKLIST DATA
        // ----------------------------------------------

        checklist:
            vehicleData.checklist || {}

    };


    // ==================================================
    // STEP 5
    // GENERATE PDF
    // ==================================================

    console.log(
        "Generating Vehicle Inspection PDF..."
    );


    const pdf =
        await inspectionReportPdfService
            .generateInspectionReportPdf(
                completeReport
            );


    // ==================================================
    // VALIDATE PDF
    // ==================================================

    if (
        !pdf ||
        !pdf.filePath ||
        !pdf.pdfPath
    ) {

        throw new Error(
            "Inspection PDF could not be generated."
        );

    }


    console.log(
        "Vehicle PDF Generated:",
        pdf.filePath
    );


    // ==================================================
    // STEP 6
    // SAVE PDF PATH IN DATABASE
    // ==================================================

    await inspectionReportRepository
        .updateInspectionReportPdfPath(

            reportId,

            pdf.pdfPath

        );


    console.log(
        "PDF path saved in inspection_reports."
    );


    // ==================================================
    // STEP 7
    // SEND PDF AUTOMATICALLY TO ADMIN
    // ==================================================

    let adminEmailResult = null;


    if (
        env.ADMIN_EMAIL
    ) {

        try {

            adminEmailResult =
                await emailService
                    .sendInspectionReportEmail({

                        to:
                            env.ADMIN_EMAIL,

                        subject:
                            `Carsey.in - Vehicle Published #${vehicleId}`,

                        customerName:
                            "Carsey.in Admin",

                        pdfPath:
                            pdf.filePath,

                        fileName:
                            pdf.fileName

                    });


            console.log(
                "Admin Vehicle PDF Email Sent Successfully."
            );

        } catch (emailError) {

            console.error(
                "Admin Vehicle PDF Email Error:",
                emailError.message
            );


            adminEmailResult = {

                success:
                    false,

                message:
                    emailError.message

            };

        }

    } else {

        adminEmailResult = {

            success:
                false,

            message:
                "ADMIN_EMAIL is not configured."

        };

    }


    // ==================================================
    // STEP 8
    // RETURN EVERYTHING TO CONTROLLER
    // ==================================================

    return {

        ...result,

        pdfGenerated:
            true,

        pdfPath:
            pdf.pdfPath,

        pdfUrl:
            pdf.pdfUrl,

        fileName:
            pdf.fileName,

        adminEmail:
            adminEmailResult,

        message:
            "Vehicle published and inspection PDF generated successfully."

    };

};


// ======================================================
// GET ALL ADMIN VEHICLES
// ======================================================

const getAllAdminVehicles = async () => {

    const vehicles =
        await vehicleRepository
            .getAllAdminVehicles();


    return {

        vehicles

    };

};


// ======================================================
// GET PUBLISHED VEHICLES
// CUSTOMER
// ======================================================

const getPublishedVehicles = async (
    filters
) => {

    // ==================================================
    // STEP 1
    // GET PUBLISHED VEHICLES
    // ==================================================

    const result =
        await vehicleRepository
            .getPublishedVehicles(
                filters
            );


    // ==================================================
    // VALIDATE RESULT
    // ==================================================

    if (!result) {

        return result;

    }


    // ==================================================
    // GET VEHICLE ARRAY
    // ==================================================

    const vehicles =
        Array.isArray(result)
            ? result
            : Array.isArray(result.vehicles)
                ? result.vehicles
                : [];


    // ==================================================
    // NO VEHICLES
    // ==================================================

    if (
        vehicles.length === 0
    ) {

        return result;

    }


    // ==================================================
    // STEP 2
    // GET IMAGES FOR EVERY VEHICLE
    // ==================================================

    const vehiclesWithImages =
        await Promise.all(

            vehicles.map(
                async (vehicle) => {

                    try {

                        const carId =
                            Number(
                                vehicle.car_id
                            );


                        // ----------------------------------
                        // INVALID CAR ID
                        // ----------------------------------

                        if (
                            !Number.isInteger(
                                carId
                            ) ||
                            carId <= 0
                        ) {

                            return {

                                ...vehicle,

                                images: []

                            };

                        }


                        // ----------------------------------
                        // GET IMAGES
                        // ----------------------------------

                        const images =
                            await vehicleImageRepository
                                .getVehicleImages(
                                    carId
                                );


                        // ----------------------------------
                        // RETURN VEHICLE + IMAGES
                        // ----------------------------------

                        return {

                            ...vehicle,

                            images:
                                Array.isArray(images)
                                    ? images
                                    : []

                        };

                    } catch (imageError) {

                        // ----------------------------------
                        // IMAGE ERROR SHOULD NOT BREAK
                        // VEHICLE LIST
                        // ----------------------------------

                        console.error(

                            `Vehicle Image Fetch Error for Car ${vehicle.car_id}:`,

                            imageError.message

                        );


                        return {

                            ...vehicle,

                            images: []

                        };

                    }

                }
            )

        );


    // ==================================================
    // STEP 3
    // PRESERVE PAGINATION
    // ==================================================

    if (
        Array.isArray(result)
    ) {

        return vehiclesWithImages;

    }


    // ==================================================
    // STEP 4
    // RETURN SAME RESPONSE STRUCTURE
    // ==================================================

    return {

        ...result,

        vehicles:
            vehiclesWithImages

    };

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicle,

    getAllAdminVehicles,

    getPublishedVehicles

};