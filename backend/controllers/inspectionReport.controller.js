const inspectionReportService =
    require(
        "../services/inspectionReport.service"
    );

const inspectionReportPdfService =
    require(
        "../services/inspectionReportPdf.service"
    );

const inspectionReportRepository =
    require(
        "../repositories/inspectionReport.repository"
    );

const vehicleRepository =
    require(
        "../repositories/vehicle.repository"
    );


// ======================================================
// CREATE INSPECTION REPORT
// ======================================================

const createInspectionReport =
    async (
        req,
        res
    ) => {

        try {

            const {
                carId,
                overallScore,
                engineRemark,
                overallRemark,
                pdfPath,
                publishStatus
            } = req.body;


            const data =
                await inspectionReportService
                    .createInspectionReport({

                        carId,

                        overallScore,

                        engineRemark,

                        overallRemark,

                        pdfPath,

                        publishStatus

                    });


            return res.status(201).json({

                success:
                    true,

                message:
                    "Inspection Report Created Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Create Inspection Report Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to create inspection report"

            });

        }

    };


// ======================================================
// GET ALL INSPECTION REPORTS
// ======================================================

const getAllInspectionReports =
    async (
        req,
        res
    ) => {

        try {

            const data =
                await inspectionReportService
                    .getAllInspectionReports();


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Reports Fetched Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Get Inspection Reports Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to fetch inspection reports"

            });

        }

    };


// ======================================================
// GET REPORT BY ID
// ======================================================

const getInspectionReportById =
    async (
        req,
        res
    ) => {

        try {

            const {
                reportId
            } = req.params;


            const data =
                await inspectionReportService
                    .getInspectionReportById(
                        reportId
                    );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report Fetched Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Get Inspection Report Error:",
                error
            );


            return res.status(404).json({

                success:
                    false,

                message:
                    error.message ||
                    "Inspection report not found"

            });

        }

    };


// ======================================================
// UPDATE / PUBLISH REPORT
// ======================================================

const updateInspectionReport =
    async (
        req,
        res
    ) => {

        try {

            const {
                reportId
            } = req.params;


            const {
                overallScore,
                engineRemark,
                overallRemark,
                publishStatus
            } = req.body;


            const data =
                await inspectionReportService
                    .updateInspectionReport(

                        reportId,

                        {

                            overallScore,

                            engineRemark,

                            overallRemark,

                            publishStatus

                        }

                    );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report Updated Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Update Inspection Report Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to update inspection report"

            });

        }

    };


// ======================================================
// CUSTOMER - GET UNLOCKED REPORT
// ======================================================

const getUnlockedInspectionReport =
    async (
        req,
        res
    ) => {

        try {

            const {
                carId
            } = req.params;


            const {
                requestId
            } = req.query;


            if (!requestId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "requestId is required."

                });

            }


            const data =
                await inspectionReportService
                    .getUnlockedInspectionReport(
                        carId,
                        requestId
                    );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report Fetched Successfully",

                data

            });

        } catch (error) {

            console.error(
                "Get Unlocked Report Error:",
                error
            );


            return res.status(403).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to access inspection report"

            });

        }

    };


// ======================================================
// CUSTOMER - GENERATE PDF
// ======================================================

const generateInspectionReportPdf =
    async (
        req,
        res
    ) => {

        try {

            const {
                carId
            } = req.params;


            const {
                requestId
            } = req.query;


            if (!requestId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "requestId is required."

                });

            }


            const data =
                await inspectionReportService
                    .getUnlockedInspectionReport(
                        carId,
                        requestId
                    );


            const vehicleData =
                await vehicleRepository
                    .getVehicleById(
                        Number(carId)
                    );


            if (!vehicleData) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Vehicle data not found."

                });

            }


            const completeReport = {

                ...data.report,

                vehicle:
                    vehicleData.vehicle,

                owner:
                    vehicleData.owner,

                inspection:
                    vehicleData.inspection,

                checklist:
                    vehicleData.checklist

            };


            const pdf =
                await inspectionReportPdfService
                    .generateInspectionReportPdf(
                        completeReport
                    );


            await inspectionReportRepository
                .updateInspectionReportPdfPath(

                    completeReport.reportId,

                    pdf.pdfPath

                );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report PDF Generated Successfully",

                data: {

                    reportId:
                        completeReport.reportId,

                    pdfPath:
                        pdf.pdfPath,

                    pdfUrl:
                        pdf.pdfUrl

                }

            });

        } catch (error) {

            console.error(
                "Generate Inspection Report PDF Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to generate inspection report PDF"

            });

        }

    };


// ======================================================
// ADMIN - GENERATE PDF
// ======================================================

const generateAdminInspectionReportPdf =
    async (
        req,
        res
    ) => {

        try {

            const {
                reportId
            } = req.params;


            const numericReportId =
                Number(reportId);


            if (
                !Number.isInteger(
                    numericReportId
                ) ||
                numericReportId <= 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid report ID."

                });

            }


            const report =
                await inspectionReportService
                    .getInspectionReportById(
                        numericReportId
                    );


            if (!report) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Inspection report not found."

                });

            }


            const vehicleData =
                await vehicleRepository
                    .getVehicleById(
                        Number(
                            report.carId
                        )
                    );


            if (!vehicleData) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Vehicle data not found."

                });

            }


            const completeReport = {

                ...report,

                vehicle:
                    vehicleData.vehicle,

                owner:
                    vehicleData.owner,

                inspection:
                    vehicleData.inspection,

                checklist:
                    vehicleData.checklist

            };


            const pdf =
                await inspectionReportPdfService
                    .generateInspectionReportPdf(
                        completeReport
                    );


            await inspectionReportRepository
                .updateInspectionReportPdfPath(

                    numericReportId,

                    pdf.pdfPath

                );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection Report PDF Generated Successfully",

                data: {

                    reportId:
                        numericReportId,

                    pdfPath:
                        pdf.pdfPath,

                    pdfUrl:
                        pdf.pdfUrl

                }

            });

        } catch (error) {

            console.error(
                "Admin Generate PDF Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to generate inspection report PDF"

            });

        }

    };


// ======================================================
// SEND REPORT TO CUSTOMER EMAIL
// ======================================================

const sendInspectionReportEmail =
    async (
        req,
        res
    ) => {

        try {

            const {
                reportId
            } = req.params;


            const {
                customerEmail
            } = req.body;


            if (
                !customerEmail ||
                !String(
                    customerEmail
                ).trim()
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Customer email is required."

                });

            }


            const data =
                await inspectionReportService
                    .sendReportToCustomerEmail(

                        reportId,

                        customerEmail

                    );


            return res.status(200).json({

                success:
                    true,

                message:
                    "Inspection report sent to customer email successfully.",

                data

            });

        } catch (error) {

            console.error(
                "Send Inspection Report Email Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Unable to send inspection report email."

            });

        }

    };


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createInspectionReport,

    getAllInspectionReports,

    getInspectionReportById,

    updateInspectionReport,

    getUnlockedInspectionReport,

    generateInspectionReportPdf,

    generateAdminInspectionReportPdf,

    sendInspectionReportEmail

};