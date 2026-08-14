const db =
    require("../config/db");


// ======================================================
// ADD VEHICLE IMAGE
// ======================================================

const addVehicleImage = (
    carId,
    imageType,
    imagePath,
    isPrimary
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `

                INSERT INTO car_images (

                    car_id,

                    image_type,

                    image_path,

                    is_primary

                )

                VALUES (

                    ?,
                    ?,
                    ?,
                    ?

                )

            `;


            db.query(

                sql,

                [

                    carId,

                    imageType,

                    imagePath,

                    isPrimary ? 1 : 0

                ],

                (
                    error,
                    result
                ) => {

                    if (error) {

                        return reject(
                            error
                        );

                    }


                    resolve(
                        result.insertId
                    );

                }

            );

        }
    );

};


// ======================================================
// GET VEHICLE IMAGES
// ======================================================

const getVehicleImages = (
    carId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `

                SELECT

                    image_id,

                    car_id,

                    image_type,

                    image_path,

                    is_primary

                FROM car_images

                WHERE car_id = ?

                ORDER BY

                    is_primary DESC,

                    image_id ASC

            `;


            db.query(

                sql,

                [carId],

                (
                    error,
                    images
                ) => {

                    if (error) {

                        return reject(
                            error
                        );

                    }


                    resolve(
                        images
                    );

                }

            );

        }
    );

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    addVehicleImage,

    getVehicleImages

};