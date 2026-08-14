const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ======================================================
// PAGE SETTINGS
// ======================================================

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const MARGIN_LEFT = 28;
const MARGIN_RIGHT = 28;
const MARGIN_TOP = 28;
const MARGIN_BOTTOM = 40;

const CONTENT_WIDTH =
    PAGE_WIDTH -
    MARGIN_LEFT -
    MARGIN_RIGHT;

// ======================================================
// COLORS
// ======================================================

const COLORS = {
    navy: "#111827",
    blue: "#2563EB",
    lightBlue: "#EFF6FF",
    border: "#D6DEE8",
    lightGray: "#F5F7FA",
    gray: "#64748B",
    dark: "#172033",
    green: "#16A34A",
    greenLight: "#DCFCE7",
    white: "#FFFFFF",
    black: "#000000"
};

// ======================================================
// SAFE VALUE
// ======================================================

const safeValue = (value, fallback = "-") => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    return String(value);
};

// ======================================================
// FIRST AVAILABLE VALUE
// ======================================================

const firstValue = (
    object,
    keys,
    fallback = "-"
) => {

    if (!object) {
        return fallback;
    }

    for (const key of keys) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {
            return object[key];
        }

    }

    return fallback;
};

// ======================================================
// TITLE CASE
// ======================================================

const titleCase = (value) => {

    if (!value) {
        return "-";
    }

    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
};

// ======================================================
// FORMAT PRICE
// ======================================================

const formatPrice = (value) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return `₹${number.toLocaleString("en-IN")}`;
};

// ======================================================
// FORMAT DATE
// ======================================================

const formatDate = (value) => {

    if (!value) {
        return "-";
    }

    try {

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch (error) {

        return String(value);

    }
};

// ======================================================
// FORMAT SCORE
// ======================================================

// ======================================================
// FORMAT SCORE
// ======================================================

const formatScore = (value) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "-";
    }

    let score = Number(value);

    if (Number.isNaN(score)) {
        return String(value);
    }

    // Old database value:
    // 43  -> 4.3
    // 85  -> 8.5
    // 100 -> 10
    if (score > 10 && score <= 100) {
        score = score / 10;
    }

    // Score should always remain between 0 and 10
    score = Math.max(
        0,
        Math.min(
            10,
            score
        )
    );

    return Number(
        score.toFixed(1)
    ).toString();
};

// ======================================================
// GET CHECKLIST ARRAY
// ======================================================

const getChecklistArray = (report) => {

    // -----------------------------------------------
    // Possible checklist keys
    // -----------------------------------------------

    let checklist =
        report.checklist ||
        report.inspectionChecklist ||
        report.checklists ||
        [];

    // -----------------------------------------------
    // Already array
    // -----------------------------------------------

    if (Array.isArray(checklist)) {
        return checklist;
    }

    // -----------------------------------------------
    // JSON string
    // -----------------------------------------------

    if (typeof checklist === "string") {

        try {

            const parsed =
                JSON.parse(checklist);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (
                parsed &&
                typeof parsed === "object"
            ) {
                checklist = parsed;
            }

        } catch (error) {

            return [];

        }

    }

    // -----------------------------------------------
    // Object
    // -----------------------------------------------

    if (
        checklist &&
        typeof checklist === "object"
    ) {

        return Object.entries(
            checklist
        ).map(
            ([key, value]) => {

                if (
                    value &&
                    typeof value === "object"
                ) {

                    return {

                        ...value,

                        area:
                            firstValue(
                                value,
                                [
                                    "area",
                                    "name",
                                    "title",
                                    "label"
                                ],
                                titleCase(key)
                            )

                    };

                }

                return {

                    area:
                        titleCase(key),

                    status:
                        value,

                    remark:
                        "-"

                };

            }
        );

    }

    return [];
};

// ======================================================
// NORMALIZE CHECKLIST
// ======================================================

const normalizeChecklist = (report) => {

    const checklist =
        getChecklistArray(report);

    // -----------------------------------------------
    // If backend already has checklist
    // -----------------------------------------------

    if (checklist.length > 0) {

        return checklist.map(
            (item, index) => {

                const area =
                    firstValue(
                        item,
                        [
                            "area",
                            "inspection_area",
                            "inspectionArea",
                            "name",
                            "title",
                            "label"
                        ],
                        `Inspection ${index + 1}`
                    );

                const status =
                    firstValue(
                        item,
                        [
                            "status",
                            "condition",
                            "result",
                            "value"
                        ],
                        "-"
                    );

                const remark =
                    firstValue(
                        item,
                        [
                            "remark",
                            "remarks",
                            "note",
                            "comment"
                        ],
                        "-"
                    );

                return {

                    area:
                        titleCase(area),

                    status:
                        safeValue(status),

                    remark:
                        safeValue(remark)

                };

            }
        );

    }

    // =================================================
    // FALLBACK
    // =================================================

    // Agar report me checklist object nahi mila,
    // to Add Vehicle ke common 9 sections se
    // checklist banayenge.
    // =================================================

    const categories = [

        {
            area: "Exterior",
            status: report.exterior_status,
            remark: report.exterior_remark
        },

        {
            area: "Interior And Electricals",
            status:
                report.interior_electricals_status ||
                report.interior_status,
            remark:
                report.interior_electricals_remark ||
                report.interior_remark
        },

        {
            area: "Engine Bay",
            status: report.engine_bay_status,
            remark: report.engine_bay_remark
        },

        {
            area: "Transmission System",
            status: report.transmission_system_status,
            remark: report.transmission_system_remark
        },

        {
            area: "Suspension And Steering",
            status: report.suspension_steering_status,
            remark: report.suspension_steering_remark
        },

        {
            area: "Braking System",
            status: report.braking_system_status,
            remark: report.braking_system_remark
        },

        {
            area: "Tyres And Wheels",
            status:
                report.tyres_wheels_status ||
                report.tyres_status,
            remark:
                report.tyres_wheels_remark ||
                report.tyres_remark
        },

        {
            area: "Electricals And AC",
            status:
                report.electricals_ac_status ||
                report.electrical_status,
            remark:
                report.electricals_ac_remark ||
                report.electrical_remark
        },

        {
            area: "Documents And Title",
            status:
                report.documents_title_status ||
                report.documents_status,
            remark:
                report.documents_title_remark ||
                report.documents_remark
        }

    ];

    return categories.map(
        item => ({

            area:
                item.area,

            status:
                safeValue(
                    item.status,
                    "Good"
                ),

            remark:
                safeValue(
                    item.remark
                )

        })
    );

};

// ======================================================
// DRAW FOOTER
// ======================================================

const drawFooter = (
    doc,
    pageNumber,
    reportId
) => {

    const footerY =
        PAGE_HEIGHT -
        25;

    doc
        .save();

    // -----------------------------------------------
    // Footer line
    // -----------------------------------------------

    doc
        .strokeColor(
            COLORS.border
        )
        .lineWidth(0.5)
        .moveTo(
            MARGIN_LEFT,
            footerY - 8
        )
        .lineTo(
            PAGE_WIDTH - MARGIN_RIGHT,
            footerY - 8
        )
        .stroke();

    // -----------------------------------------------
    // Left footer
    // -----------------------------------------------

    doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(
            COLORS.gray
        )
        .text(
            "Generated by Carsey.in",
            MARGIN_LEFT,
            footerY,
            {
                width: 220,
                align: "left"
            }
        );

    // -----------------------------------------------
    // Right footer
    // -----------------------------------------------

    doc
        .text(
            `Vehicle Inspection Report #${reportId} | Page ${pageNumber}`,
            PAGE_WIDTH - 280,
            footerY,
            {
                width: 252,
                align: "right"
            }
        );

    doc
        .restore();

};

// ======================================================
// DRAW HEADER
// ======================================================

const drawReportHeader = (
    doc,
    report
) => {

    const reportId =
        firstValue(
            report,
            [
                "reportId",
                "report_id",
                "id"
            ],
            "-"
        );

    const carId =
        firstValue(
            report,
            [
                "carId",
                "car_id",
                "vehicleId",
                "vehicle_id"
            ],
            "-"
        );

    const headerHeight = 72;

    // -----------------------------------------------
    // Header box
    // -----------------------------------------------

    doc
        .roundedRect(
            MARGIN_LEFT,
            MARGIN_TOP,
            CONTENT_WIDTH,
            headerHeight,
            7
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    // -----------------------------------------------
    // Logo / title
    // -----------------------------------------------

    doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(
            COLORS.dark
        )
        .text(
            "Carsey.in",
            MARGIN_LEFT + 14,
            MARGIN_TOP + 13
        );

    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(
            COLORS.gray
        )
        .text(
            "Vehicle Inspection Report",
            MARGIN_LEFT + 15,
            MARGIN_TOP + 42
        );

    // -----------------------------------------------
    // Report number
    // -----------------------------------------------

    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(
            COLORS.gray
        )
        .text(
            "REPORT",
            PAGE_WIDTH - 130,
            MARGIN_TOP + 15,
            {
                width: 90,
                align: "right"
            }
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor(
            COLORS.dark
        )
        .text(
            `#${reportId}`,
            PAGE_WIDTH - 130,
            MARGIN_TOP + 27,
            {
                width: 90,
                align: "right"
            }
        );

    // -----------------------------------------------
    // Car ID
    // -----------------------------------------------

    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(
            COLORS.gray
        )
        .text(
            "CAR ID",
            PAGE_WIDTH - 130,
            MARGIN_TOP + 48,
            {
                width: 90,
                align: "right"
            }
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(
            COLORS.dark
        )
        .text(
            `#${carId}`,
            PAGE_WIDTH - 130,
            MARGIN_TOP + 58,
            {
                width: 90,
                align: "right"
            }
        );

    return (
        MARGIN_TOP +
        headerHeight +
        12
    );

};

// ======================================================
// DRAW SECTION HEADER
// ======================================================

const drawSectionHeader = (
    doc,
    title,
    y
) => {

    const height = 25;

    doc
        .roundedRect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            height,
            5
        )
        .fill(
            COLORS.navy
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(
            COLORS.white
        )
        .text(
            title,
            MARGIN_LEFT + 10,
            y + 7,
            {
                width:
                    CONTENT_WIDTH - 20
            }
        );

    return y + height;

};

// ======================================================
// DRAW FIELD
// ======================================================

const drawField = (
    doc,
    x,
    y,
    width,
    label,
    value
) => {

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray
        )
        .text(
            label.toUpperCase(),
            x,
            y
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(value),
            x,
            y + 11,
            {
                width:
                    width - 10,
                height: 22,
                ellipsis: true
            }
        );

};

// ======================================================
// DRAW VEHICLE DETAILS
// ======================================================

const drawVehicleDetails = (
    doc,
    report,
    y
) => {

    y =
        drawSectionHeader(
            doc,
            "Vehicle Details",
            y
        );

    y += 5;

    const rowHeight = 43;

    const columnWidth =
        CONTENT_WIDTH / 3;

    const vehicleFields = [

        [
            "Brand",
            firstValue(
                report,
                ["brand"],
                "-"
            )
        ],

        [
            "Model",
            firstValue(
                report,
                ["model"],
                "-"
            )
        ],

        [
            "Variant",
            firstValue(
                report,
                ["variant"],
                "-"
            )
        ],

        [
            "Manufacturing Year",
            firstValue(
                report,
                [
                    "manufacturingYear",
                    "manufacturing_year"
                ],
                "-"
            )
        ],

        [
            "Price",
            formatPrice(
                firstValue(
                    report,
                    ["price"],
                    ""
                )
            )
        ],

        [
            "Price Note",
            firstValue(
                report,
                [
                    "priceShortNote",
                    "price_short_note"
                ],
                "-"
            )
        ],

        [
            "Odometer",
            firstValue(
                report,
                ["odometer"],
                "-"
            ) === "-"
                ? "-"
                : `${firstValue(
                    report,
                    ["odometer"],
                    "-"
                )} KM`
        ],

        [
            "Fuel Type",
            firstValue(
                report,
                [
                    "fuelType",
                    "fuel_type"
                ],
                "-"
            )
        ],

        [
            "Transmission",
            firstValue(
                report,
                ["transmission"],
                "-"
            )
        ],

        [
            "Owner Classification",
            firstValue(
                report,
                [
                    "ownerClassification",
                    "owner_classification"
                ],
                "-"
            )
        ],

        [
            "Registration Number",
            firstValue(
                report,
                [
                    "registrationNumber",
                    "registration_number"
                ],
                "-"
            )
        ],

        [
            "Chassis Number",
            firstValue(
                report,
                [
                    "chassisNumber",
                    "chassis_number"
                ],
                "-"
            )
        ],

        [
            "Engine Number",
            firstValue(
                report,
                [
                    "engineNumber",
                    "engine_number"
                ],
                "-"
            )
        ],

        [
            "City",
            firstValue(
                report,
                ["city"],
                "-"
            )
        ],

        [
            "Inspection Date",
            formatDate(
                firstValue(
                    report,
                    [
                        "inspectionDate",
                        "inspection_date"
                    ],
                    ""
                )
            )
        ],

        [
            "RTO",
            firstValue(
                report,
                ["rto"],
                "-"
            )
        ],

        [
            "Spare Key",
            firstValue(
                report,
                [
                    "spareKey",
                    "spare_key"
                ],
                "-"
            )
        ],

        [
            "Insurance Type",
            firstValue(
                report,
                [
                    "insuranceType",
                    "insurance_type"
                ],
                "-"
            )
        ],

        [
            "Insurance Validity",
            formatDate(
                firstValue(
                    report,
                    [
                        "insuranceValidity",
                        "insurance_validity"
                    ],
                    ""
                )
            )
        ],

        [
            "Status",
            firstValue(
                report,
                ["status"],
                firstValue(
                    report,
                    ["publishStatus"],
                    "Published"
                )
            )
        ],

        [
            "Created Date",
            formatDate(
                firstValue(
                    report,
                    [
                        "createdAt",
                        "created_at"
                    ],
                    new Date()
                )
            )
        ]

    ];

    // -----------------------------------------------
    // Draw rows
    // -----------------------------------------------

    for (
        let i = 0;
        i < vehicleFields.length;
        i += 3
    ) {

        const row =
            vehicleFields.slice(
                i,
                i + 3
            );

        const rowY = y;

        // -------------------------------------------
        // Row background
        // -------------------------------------------

        doc
            .rect(
                MARGIN_LEFT,
                rowY,
                CONTENT_WIDTH,
                rowHeight
            )
            .fillAndStroke(
                COLORS.white,
                COLORS.border
            );

        // -------------------------------------------
        // Vertical borders
        // -------------------------------------------

        doc
            .strokeColor(
                COLORS.border
            )
            .lineWidth(0.5);

        for (
            let column = 1;
            column < 3;
            column++
        ) {

            doc
                .moveTo(
                    MARGIN_LEFT +
                    columnWidth * column,
                    rowY
                )
                .lineTo(
                    MARGIN_LEFT +
                    columnWidth * column,
                    rowY + rowHeight
                )
                .stroke();

        }

        // -------------------------------------------
        // Fields
        // -------------------------------------------

        row.forEach(
            (
                [label, value],
                index
            ) => {

                drawField(
                    doc,
                    MARGIN_LEFT +
                        columnWidth *
                        index +
                        8,
                    rowY + 8,
                    columnWidth,
                    label,
                    value
                );

            }
        );

        y += rowHeight;

    }

    // -----------------------------------------------
    // Vehicle Note
    // -----------------------------------------------

    const vehicleNote =
        firstValue(
            report,
            [
                "vehicleNote",
                "vehicle_note"
            ],
            "-"
        );

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            35
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray
        )
        .text(
            "VEHICLE NOTE",
            MARGIN_LEFT + 8,
            y + 7
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(
                vehicleNote
            ),
            MARGIN_LEFT + 8,
            y + 18,
            {
                width:
                    CONTENT_WIDTH - 16
            }
        );

    y += 43;

    return y;

};

// ======================================================
// DRAW OWNER DETAILS
// ======================================================

const drawOwnerDetails = (
    doc,
    report,
    y
) => {

    y =
        drawSectionHeader(
            doc,
            "Owner Details",
            y
        );

    y += 5;

    const owner =
        report.owner &&
        typeof report.owner === "object"
            ? report.owner
            : report;

    const rowHeight = 43;

    const columnWidth =
        CONTENT_WIDTH / 3;

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            rowHeight
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    // -----------------------------------------------
    // Vertical lines
    // -----------------------------------------------

    doc
        .strokeColor(
            COLORS.border
        )
        .lineWidth(0.5);

    doc
        .moveTo(
            MARGIN_LEFT +
            columnWidth,
            y
        )
        .lineTo(
            MARGIN_LEFT +
            columnWidth,
            y + rowHeight
        )
        .stroke();

    doc
        .moveTo(
            MARGIN_LEFT +
            columnWidth * 2,
            y
        )
        .lineTo(
            MARGIN_LEFT +
            columnWidth * 2,
            y + rowHeight
        )
        .stroke();

    // -----------------------------------------------
    // Owner Name
    // -----------------------------------------------

    drawField(
        doc,
        MARGIN_LEFT + 8,
        y + 8,
        columnWidth,
        "Owner Name",
        firstValue(
            owner,
            [
                "ownerName",
                "owner_name",
                "name"
            ],
            "-"
        )
    );

    // -----------------------------------------------
    // Mobile
    // -----------------------------------------------

    drawField(
        doc,
        MARGIN_LEFT +
            columnWidth +
            8,
        y + 8,
        columnWidth,
        "Mobile",
        firstValue(
            owner,
            [
                "mobile",
                "ownerMobile",
                "owner_mobile",
                "phone"
            ],
            "-"
        )
    );

    // -----------------------------------------------
    // Email
    // -----------------------------------------------

    drawField(
        doc,
        MARGIN_LEFT +
            columnWidth * 2 +
            8,
        y + 8,
        columnWidth,
        "Email",
        firstValue(
            owner,
            [
                "email",
                "ownerEmail",
                "owner_email"
            ],
            "-"
        )
    );

    y += rowHeight;

    // -----------------------------------------------
    // Address
    // -----------------------------------------------

    const address =
        firstValue(
            owner,
            [
                "address",
                "ownerAddress",
                "owner_address"
            ],
            "-"
        );

    doc
        .rect(
            MARGIN_LEFT,
            y,
            CONTENT_WIDTH,
            45
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray
        )
        .text(
            "ADDRESS",
            MARGIN_LEFT + 8,
            y + 8
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(address),
            MARGIN_LEFT + 8,
            y + 20,
            {
                width:
                    CONTENT_WIDTH - 16,
                height: 20
            }
        );

    y += 52;

    return y;

};

// ======================================================
// DRAW INSPECTION SUMMARY
// ======================================================

const drawInspectionSummary = (
    doc,
    report,
    y
) => {

    y =
        drawSectionHeader(
            doc,
            "Inspection Summary",
            y
        );

    y += 6;

    const score =
        firstValue(
            report,
            [
                "overallScore",
                "overall_score",
                "score"
            ],
            "-"
        );

    const engineRemark =
        firstValue(
            report,
            [
                "engineRemark",
                "engine_remark"
            ],
            "Not provided."
        );

    const overallRemark =
        firstValue(
            report,
            [
                "overallRemark",
                "overall_remark"
            ],
            "Vehicle inspection completed."
        );

    const boxGap = 8;

    const scoreWidth = 100;

    const remainingWidth =
        CONTENT_WIDTH -
        scoreWidth -
        boxGap * 2;

    const remarkWidth =
        remainingWidth / 2;

    const boxHeight = 72;

    // -----------------------------------------------
    // Score box
    // -----------------------------------------------

    doc
        .roundedRect(
            MARGIN_LEFT,
            y,
            scoreWidth,
            boxHeight,
            6
        )
        .fillAndStroke(
            COLORS.lightBlue,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray
        )
        .text(
            "OVERALL SCORE",
            MARGIN_LEFT + 9,
            y + 10
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(
            COLORS.dark
        )
        .text(
            formatScore(score),
            MARGIN_LEFT + 9,
            y + 27
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(
            COLORS.dark
        )
        .text(
            "/ 10",
            MARGIN_LEFT + 62,
            y + 39
        );

    // -----------------------------------------------
    // Engine remark
    // -----------------------------------------------

    const engineX =
        MARGIN_LEFT +
        scoreWidth +
        boxGap;

    doc
        .roundedRect(
            engineX,
            y,
            remarkWidth,
            boxHeight,
            6
        )
        .fillAndStroke(
            COLORS.lightBlue,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray
        )
        .text(
            "ENGINE REMARK",
            engineX + 9,
            y + 10
        );

    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(
                engineRemark
            ),
            engineX + 9,
            y + 27,
            {
                width:
                    remarkWidth - 18,
                height: 35
            }
        );

    // -----------------------------------------------
    // Overall remark
    // -----------------------------------------------

    const overallX =
        engineX +
        remarkWidth +
        boxGap;

    doc
        .roundedRect(
            overallX,
            y,
            remarkWidth,
            boxHeight,
            6
        )
        .fillAndStroke(
            COLORS.lightBlue,
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .fillColor(
            COLORS.gray
        )
        .text(
            "OVERALL REMARK",
            overallX + 9,
            y + 10
        );

    doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(
                overallRemark
            ),
            overallX + 9,
            y + 27,
            {
                width:
                    remarkWidth - 18,
                height: 35
            }
        );

    y += boxHeight + 10;

    return y;

};

// ======================================================
// CHECKLIST ROW HEIGHT
// ======================================================

const getChecklistRowHeight = (
    doc,
    area,
    status,
    remark,
    widths
) => {

    doc
        .font("Helvetica")
        .fontSize(8);

    const areaHeight =
        doc.heightOfString(
            safeValue(area),
            {
                width:
                    widths[0] - 14
            }
        );

    const statusHeight =
        doc.heightOfString(
            safeValue(status),
            {
                width:
                    widths[1] - 14
            }
        );

    const remarkHeight =
        doc.heightOfString(
            safeValue(remark),
            {
                width:
                    widths[2] - 14
            }
        );

    return Math.max(
        32,
        Math.max(
            areaHeight,
            statusHeight,
            remarkHeight
        ) + 18
    );

};

// ======================================================
// DRAW CHECKLIST HEADER
// ======================================================

const drawChecklistHeader = (
    doc,
    x,
    y,
    widths
) => {

    const height = 28;

    doc
        .rect(
            x,
            y,
            widths[0],
            height
        )
        .fillAndStroke(
            "#EDF3F9",
            COLORS.border
        );

    doc
        .rect(
            x + widths[0],
            y,
            widths[1],
            height
        )
        .fillAndStroke(
            "#EDF3F9",
            COLORS.border
        );

    doc
        .rect(
            x +
                widths[0] +
                widths[1],
            y,
            widths[2],
            height
        )
        .fillAndStroke(
            "#EDF3F9",
            COLORS.border
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            COLORS.gray
        )
        .text(
            "INSPECTION AREA",
            x + 7,
            y + 10,
            {
                width:
                    widths[0] - 14
            }
        );

    doc
        .text(
            "STATUS",
            x +
                widths[0] +
                7,
            y + 10,
            {
                width:
                    widths[1] - 14
            }
        );

    doc
        .text(
            "REMARK",
            x +
                widths[0] +
                widths[1] +
                7,
            y + 10,
            {
                width:
                    widths[2] - 14
            }
        );

    return y + height;

};

// ======================================================
// DRAW CHECKLIST ROW
// ======================================================

const drawChecklistRow = (
    doc,
    x,
    y,
    widths,
    area,
    status,
    remark
) => {

    const height =
        getChecklistRowHeight(
            doc,
            area,
            status,
            remark,
            widths
        );

    const x1 = x;

    const x2 =
        x +
        widths[0];

    const x3 =
        x +
        widths[0] +
        widths[1];

    // -----------------------------------------------
    // Cell backgrounds
    // -----------------------------------------------

    doc
        .rect(
            x1,
            y,
            widths[0],
            height
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .rect(
            x2,
            y,
            widths[1],
            height
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    doc
        .rect(
            x3,
            y,
            widths[2],
            height
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    // -----------------------------------------------
    // Area
    // -----------------------------------------------

    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(area),
            x1 + 7,
            y + 11,
            {
                width:
                    widths[0] - 14
            }
        );

    // -----------------------------------------------
    // Status
    // -----------------------------------------------

    const statusText =
        safeValue(status);

    const statusWidth = 42;
    const statusHeight = 16;

    doc
        .roundedRect(
            x2 + 7,
            y + 8,
            statusWidth,
            statusHeight,
            8
        )
        .fill(
            COLORS.greenLight
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor(
            COLORS.green
        )
        .text(
            statusText,
            x2 + 7,
            y + 12,
            {
                width:
                    statusWidth,
                align: "center"
            }
        );

    // -----------------------------------------------
    // Remark
    // -----------------------------------------------

    doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(
            COLORS.dark
        )
        .text(
            safeValue(remark),
            x3 + 7,
            y + 11,
            {
                width:
                    widths[2] - 14
            }
        );

    return y + height;

};

// ======================================================
// GENERATE INSPECTION REPORT PDF
// ======================================================

const generateInspectionReportPdf = (
    report
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            try {

                // ==================================================
                // VALIDATE REPORT
                // ==================================================

                if (!report) {

                    return reject(
                        new Error(
                            "Inspection report data is missing."
                        )
                    );

                }

                // ==================================================
                // REPORT ID
                // ==================================================

                const reportId =
                    firstValue(
                        report,
                        [
                            "reportId",
                            "report_id",
                            "id"
                        ],
                        null
                    );

                if (!reportId) {

                    return reject(
                        new Error(
                            "Report ID is missing."
                        )
                    );

                }

                // ==================================================
                // CAR ID
                // ==================================================

                const carId =
                    firstValue(
                        report,
                        [
                            "carId",
                            "car_id",
                            "vehicleId",
                            "vehicle_id"
                        ],
                        null
                    );

                if (!carId) {

                    return reject(
                        new Error(
                            "Car ID is missing."
                        )
                    );

                }

                // ==================================================
                // UPLOAD DIRECTORY
                // ==================================================

                const reportsDirectory =
                    path.join(
                        process.cwd(),
                        "uploads",
                        "reports"
                    );

                // ==================================================
                // CREATE DIRECTORY
                // ==================================================

                if (
                    !fs.existsSync(
                        reportsDirectory
                    )
                ) {

                    fs.mkdirSync(
                        reportsDirectory,
                        {
                            recursive: true
                        }
                    );

                }

                // ==================================================
                // FILE NAME
                // ==================================================

                const fileName =
                    `car-${carId}-inspection-report-${reportId}.pdf`;

                // ==================================================
                // FILE PATH
                // ==================================================

                const filePath =
                    path.join(
                        reportsDirectory,
                        fileName
                    );

                // ==================================================
                // CREATE PDF
                // ==================================================

                const doc =
                    new PDFDocument({

                        size: "A4",

                        margin: 0,

                        autoFirstPage: true

                    });

                // ==================================================
                // CREATE STREAM
                // ==================================================

                const stream =
                    fs.createWriteStream(
                        filePath
                    );

                // ==================================================
                // STREAM ERROR
                // ==================================================

                stream.on(
                    "error",
                    error => {

                        console.error(
                            "PDF Stream Error:",
                            error
                        );

                        reject(error);

                    }
                );

                // ==================================================
                // PDF ERROR
                // ==================================================

                doc.on(
                    "error",
                    error => {

                        console.error(
                            "PDF Document Error:",
                            error
                        );

                        reject(error);

                    }
                );

                // ==================================================
                // PDF FINISHED
                // ==================================================

                stream.on(
                    "finish",
                    () => {

                        console.log(
                            "Inspection Report PDF Generated:",
                            filePath
                        );

                        resolve({

                            fileName,

                            filePath,

                            pdfPath:
                                `uploads/reports/${fileName}`

                        });

                    }
                );

                // ==================================================
                // CONNECT PDF TO STREAM
                // ==================================================

                doc.pipe(stream);

                // ==================================================
                // NORMALIZE REPORT
                // ==================================================
// ======================================================
// NORMALIZE COMPLETE REPORT
// ======================================================

const vehicle =
    report.vehicle &&
    typeof report.vehicle === "object"
        ? report.vehicle
        : {};

const owner =
    report.owner &&
    typeof report.owner === "object"
        ? report.owner
        : {};

const inspection =
    report.inspection &&
    typeof report.inspection === "object"
        ? report.inspection
        : {};

const normalizedReport = {

    // Original report data
    ...report,

    // Vehicle data ko top-level par available karo
    ...vehicle,

    // Owner data ko top-level par available karo
    ...owner,

    // Inspection data ko top-level par available karo
    ...inspection,

    // Nested objects bhi preserve karo
    vehicle: vehicle,

    owner: owner,

    inspection: inspection,

    // Checklist
    checklist:
        report.checklist ||
        vehicle.checklist ||
        inspection.checklist ||
        []
};

                // ==================================================
                // PAGE 1
                // ==================================================

                let y =
                    drawReportHeader(
                        doc,
                        normalizedReport
                    );

                // ==================================================
                // VEHICLE DETAILS
                // ==================================================

                y =
                    drawVehicleDetails(
                        doc,
                        normalizedReport,
                        y
                    );

                // ==================================================
                // OWNER DETAILS
                // ==================================================

                y =
                    drawOwnerDetails(
                        doc,
                        normalizedReport,
                        y
                    );

                // ==================================================
                // INSPECTION SUMMARY
                // ==================================================

                y =
                    drawInspectionSummary(
                        doc,
                        normalizedReport,
                        y
                    );

                // ==================================================
                // PAGE 1 FOOTER
                // ==================================================

                drawFooter(
                    doc,
                    1,
                    reportId
                );

                // ==================================================
                // PAGE 2
                // CHECKLIST
                // ==================================================

                doc.addPage();

                y = MARGIN_TOP;

                // ==================================================
                // CHECKLIST SECTION
                // ==================================================

                y =
                    drawSectionHeader(
                        doc,
                        "Inspection Checklist",
                        y
                    );

                y += 8;

                // ==================================================
                // CHECKLIST DATA
                // ==================================================

                const checklist =
                    normalizeChecklist(
                        normalizedReport
                    );

                // ==================================================
                // TABLE WIDTHS
                // ==================================================

                const areaWidth = 190;

                const statusWidth = 90;

                const remarkWidth =
                    CONTENT_WIDTH -
                    areaWidth -
                    statusWidth;

                const checklistWidths = [

                    areaWidth,

                    statusWidth,

                    remarkWidth

                ];

                // ==================================================
                // TABLE HEADER
                // ==================================================

                y =
                    drawChecklistHeader(
                        doc,
                        MARGIN_LEFT,
                        y,
                        checklistWidths
                    );

                // ==================================================
                // TABLE ROWS
                // ==================================================

                checklist.forEach(
                    item => {

                        y =
                            drawChecklistRow(
                                doc,
                                MARGIN_LEFT,
                                y,
                                checklistWidths,
                                item.area,
                                item.status,
                                item.remark
                            );

                    }
                );

                // ==================================================
                // PAGE 2 FOOTER
                // ==================================================

                drawFooter(
                    doc,
                    2,
                    reportId
                );

                // ==================================================
                // FINISH
                // ==================================================

                doc.end();

            } catch (error) {

                console.error(
                    "Generate Inspection PDF Error:",
                    error
                );

                reject(error);

            }

        }
    );

};

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    generateInspectionReportPdf

};