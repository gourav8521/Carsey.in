const db =
    require("../config/db");


// ======================================================
// GET SINGLE VEHICLE
// ======================================================

const getVehicleById = (
    carId
) => {

    return new Promise(
        (resolve, reject) => {

            const vehicleSql = `

                SELECT

                    c.*

                FROM cars c

                WHERE c.car_id = ?

                LIMIT 1

            `;


            db.query(

                vehicleSql,

                [carId],

                (
                    vehicleError,
                    vehicles
                ) => {

                    if (
                        vehicleError
                    ) {

                        return reject(
                            vehicleError
                        );

                    }


                    if (
                        vehicles.length === 0
                    ) {

                        return resolve(
                            null
                        );

                    }


                    const vehicle =
                        vehicles[0];


                    // =========================================
                    // OWNER
                    // =========================================

                    const ownerSql = `

                        SELECT

                            o.*

                        FROM owners o

                        WHERE o.owner_id = ?

                        LIMIT 1

                    `;


                    db.query(

                        ownerSql,

                        [
                            vehicle.owner_id
                        ],

                        (
                            ownerError,
                            owners
                        ) => {

                            if (
                                ownerError
                            ) {

                                return reject(
                                    ownerError
                                );

                            }


                            const owner =
                                owners[0] ||
                                null;


                            // =================================
                            // INSPECTION REPORT
                            // =================================

                            const reportSql = `

                                SELECT

                                    ir.*

                                FROM inspection_reports ir

                                WHERE ir.car_id = ?

                                ORDER BY
                                    ir.report_id DESC

                                LIMIT 1

                            `;


                            db.query(

                                reportSql,

                                [carId],

                                (
                                    reportError,
                                    reports
                                ) => {

                                    if (
                                        reportError
                                    ) {

                                        return reject(
                                            reportError
                                        );

                                    }


                                    const report =
                                        reports[0] ||
                                        null;


                                    // =================================
                                    // CHECKLIST
                                    // =================================

                                    if (
                                        !report
                                    ) {

                                        return resolve({

                                            vehicle,

                                            owner,

                                            inspection:
                                                null,

                                            checklist: {}

                                        });

                                    }


                                    const checklistSql = `

                                        SELECT

                                            category,

                                            status,

                                            remark

                                        FROM inspection_checklist

                                        WHERE report_id = ?

                                    `;


                                    db.query(

                                        checklistSql,

                                        [
                                            report.report_id
                                        ],

                                        (
                                            checklistError,
                                            rows
                                        ) => {

                                            if (
                                                checklistError
                                            ) {

                                                return reject(
                                                    checklistError
                                                );

                                            }


                                            const checklist = {};


                                            rows.forEach(
                                                row => {

                                                    let key =
                                                        row.category;


                                                    // =================================
                                                    // CATEGORY → ANGULAR KEY
                                                    // =================================

                                                    const categoryMap = {

                                                        "Exterior":
                                                            "exterior",

                                                        "Interior & Electricals":
                                                            "interior_electricals",

                                                        "Engine Bay":
                                                            "engine_bay",

                                                        "Transmission System":
                                                            "transmission_system",

                                                        "Suspension & Steering":
                                                            "suspension_steering",

                                                        "Braking System":
                                                            "braking_system",

                                                        "Tires & Wheels":
                                                            "tires_wheels",

                                                        "Electricals & AC":
                                                            "electricals_ac",

                                                        "Documents & Title":
                                                            "documents_title"

                                                    };


                                                    key =
                                                        categoryMap[
                                                            row.category
                                                        ] ||
                                                        key;


                                                    checklist[key] = {

                                                        status:
                                                            row.status,

                                                        remark:
                                                            row.remark ||
                                                            ''

                                                    };

                                                }
                                            );


                                            resolve({

                                                vehicle,

                                                owner,

                                                inspection: {

                                                    engine_remark:
                                                        report.engine_remark,

                                                    overall_remark:
                                                        report.overall_remark,

                                                    overall_score:
                                                        Number(
                                                            report.overall_score
                                                        ) / 10

                                                },

                                                checklist

                                            });

                                        }

                                    );

                                }

                            );

                        }

                    );

                }

            );

        }
    );

};


// ======================================================
// UPDATE VEHICLE
// ======================================================

const updateVehicle = (
    carId,
    vehicle
) => {

    return new Promise(
        (resolve, reject) => {

            const allowedStatuses = [

                "Draft",

                "Published",

                "Available",

                "Sold",

                "Inactive"

            ];


            const status =
                allowedStatuses.includes(
                    vehicle.status
                )
                    ? vehicle.status
                    : "Draft";


            const publishedAt =
                status === "Published"
                    ? new Date()
                    : null;


            // =========================================
            // UPDATE VEHICLE
            // =========================================

            const vehicleSql = `

                UPDATE cars

                SET

                    brand = ?,

                    model = ?,

                    variant = ?,

                    manufacturing_year = ?,

                    price = ?,

                    price_short_note = ?,

                    odometer = ?,

                    city = ?,

                    transmission = ?,

                    fuel_type = ?,

                    owner_classification = ?,

                    registration_number = ?,

                    chassis_number = ?,

                    engine_number = ?,

                    inspection_date = ?,

                    rto = ?,

                    spare_key = ?,

                    insurance_type = ?,

                    insurance_validity = ?,

                    vehicle_note = ?,

                    status = ?,

                    published_at = ?

                WHERE car_id = ?

            `;


            db.query(

                vehicleSql,

                [

                    vehicle.brand ?? null,

                    vehicle.model ?? null,

                    vehicle.variant ?? null,

                    vehicle.manufacturing_year ?? null,

                    vehicle.price ?? null,

                    vehicle.price_short_note ?? null,

                    vehicle.odometer ?? null,

                    vehicle.city ?? null,

                    vehicle.transmission ?? null,

                    vehicle.fuel_type ?? null,

                    vehicle.owner_classification ?? null,

                    vehicle.registration_number ?? null,

                    vehicle.chassis_number ?? null,

                    vehicle.engine_number ?? null,

                    vehicle.inspection_date || null,

                    vehicle.rto ?? null,

                    vehicle.spare_key ?? null,

                    vehicle.insurance_type ?? null,

                    vehicle.insurance_validity || null,

                    vehicle.vehicle_note ?? null,

                    status,

                    publishedAt,

                    carId

                ],

                (
                    vehicleError
                ) => {

                    if (
                        vehicleError
                    ) {

                        return reject(
                            vehicleError
                        );

                    }


                    // =====================================
                    // OWNER
                    // =====================================

                    const ownerSql = `

                        UPDATE owners

                        SET

                            owner_name = ?,

                            mobile = ?,

                            email = ?,

                            address = ?,

                            city = ?,

                            state = ?,

                            pincode = ?,

                            pan_number = ?

                        WHERE owner_id = (

                            SELECT owner_id

                            FROM cars

                            WHERE car_id = ?

                        )

                    `;


                    db.query(

                        ownerSql,

                        [

                            vehicle.customer_name ??
                                null,

                            vehicle.owner_mobile ??
                                null,

                            vehicle.owner_email ??
                                null,

                            vehicle.owner_address ??
                                null,

                            vehicle.owner_city ??
                                null,

                            vehicle.owner_state ??
                                null,

                            vehicle.owner_pincode ??
                                null,

                            vehicle.pan_number ??
                                null,

                            carId

                        ],

                        (
                            ownerError
                        ) => {

                            if (
                                ownerError
                            ) {

                                return reject(
                                    ownerError
                                );

                            }


                            // =====================================
                            // INSPECTION
                            // =====================================

                            const score =
                                Number(
                                    vehicle.overall_score
                                ) || 0;


                            const overallScore =
                                Math.round(
                                    score * 10
                                );


                            const reportSql = `

                                SELECT

                                    report_id

                                FROM inspection_reports

                                WHERE car_id = ?

                                ORDER BY
                                    report_id DESC

                                LIMIT 1

                            `;


                            db.query(

                                reportSql,

                                [carId],

                                (
                                    reportError,
                                    reports
                                ) => {

                                    if (
                                        reportError
                                    ) {

                                        return reject(
                                            reportError
                                        );

                                    }


                                    if (
                                        reports.length === 0
                                    ) {

                                        return resolve({

                                            carId,

                                            message:
                                                "Vehicle and owner updated successfully."

                                        });

                                    }


                                    const reportId =
                                        reports[0]
                                            .report_id;


                                    const updateReportSql = `

                                        UPDATE inspection_reports

                                        SET

                                            overall_score = ?,

                                            engine_remark = ?,

                                            overall_remark = ?,

                                            publish_status = ?

                                        WHERE report_id = ?

                                    `;


                                    db.query(

                                        updateReportSql,

                                        [

                                            overallScore,

                                            vehicle.engine_remark ??
                                                null,

                                            vehicle.overall_remark ??
                                                null,

                                            status === "Published"
                                                ? "Yes"
                                                : "No",

                                            reportId

                                        ],

                                        (
                                            reportUpdateError
                                        ) => {

                                            if (
                                                reportUpdateError
                                            ) {

                                                return reject(
                                                    reportUpdateError
                                                );

                                            }


                                            // =====================================
                                            // CHECKLIST
                                            // =====================================

                                            const checklist =
                                                vehicle.inspection_checklist;


                                            if (
                                                !checklist
                                            ) {

                                                return resolve({

                                                    carId,

                                                    message:
                                                        "Vehicle updated successfully."

                                                });

                                            }


                                            const categoryMap = {

                                                exterior:
                                                    "Exterior",

                                                interior_electricals:
                                                    "Interior & Electricals",

                                                engine_bay:
                                                    "Engine Bay",

                                                transmission_system:
                                                    "Transmission System",

                                                suspension_steering:
                                                    "Suspension & Steering",

                                                braking_system:
                                                    "Braking System",

                                                tires_wheels:
                                                    "Tires & Wheels",

                                                electricals_ac:
                                                    "Electricals & AC",

                                                documents_title:
                                                    "Documents & Title"

                                            };


                                            const keys =
                                                Object.keys(
                                                    categoryMap
                                                );


                                            const rows =
                                                keys.map(
                                                    key => {

                                                        const item =
                                                            checklist[
                                                                key
                                                            ] || {};


                                                        return [

                                                            reportId,

                                                            categoryMap[
                                                                key
                                                            ],

                                                            item.status ||
                                                                "Good",

                                                            item.remark ||
                                                                null

                                                        ];

                                                    }
                                                );


                                            // =====================================
                                            // DELETE OLD CHECKLIST
                                            // =====================================

                                            db.query(

                                                `

                                                    DELETE FROM inspection_checklist

                                                    WHERE report_id = ?

                                                `,

                                                [
                                                    reportId
                                                ],

                                                (
                                                    deleteError
                                                ) => {

                                                    if (
                                                        deleteError
                                                    ) {

                                                        return reject(
                                                            deleteError
                                                        );

                                                    }


                                                    // =================================
                                                    // INSERT NEW CHECKLIST
                                                    // =================================

                                                    const checklistSql = `

                                                        INSERT INTO inspection_checklist (

                                                            report_id,

                                                            category,

                                                            status,

                                                            remark

                                                        )

                                                        VALUES ?

                                                    `;


                                                    db.query(

                                                        checklistSql,

                                                        [
                                                            rows
                                                        ],

                                                        (
                                                            checklistError
                                                        ) => {

                                                            if (
                                                                checklistError
                                                            ) {

                                                                return reject(
                                                                    checklistError
                                                                );

                                                            }


                                                            resolve({

                                                                carId,

                                                                reportId,

                                                                message:
                                                                    "Vehicle, owner, inspection and checklist updated successfully."

                                                            });

                                                        }

                                                    );

                                                }

                                            );

                                        }

                                    );

                                }

                            );

                        }

                    );

                }

            );

        }
    );

};


module.exports = {

    getVehicleById,

    updateVehicle

};