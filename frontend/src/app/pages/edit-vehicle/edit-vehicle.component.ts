import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  VehicleService
} from '../../services/vehicle.service';

@Component({

  selector: 'app-edit-vehicle',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './edit-vehicle.component.html',


})
export class EditVehicleComponent
  implements OnInit {


  private vehicleService =
    inject(VehicleService);

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);


  // =====================================================
  // ID
  // =====================================================

  carId = 0;


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;

  saving = false;


  // =====================================================
  // MESSAGES
  // =====================================================

  successMessage = '';

  errorMessage = '';


  // =====================================================
  // VEHICLE
  // =====================================================

  vehicle: any = {

    brand: '',

    model: '',

    variant: '',

    manufacturing_year:
      new Date().getFullYear(),

    price: null,

    price_short_note: '',

    odometer: null,

    city: '',

    transmission: 'Manual',

    fuel_type: 'Petrol',

    owner_classification: 'First',

    registration_number: '',

    chassis_number: '',

    engine_number: '',

    inspection_date: '',

    rto: '',

    spare_key: 'Yes',

    insurance_type: '',

    insurance_validity: '',

    vehicle_note: '',

    status: 'Draft'

  };


  // =====================================================
  // OWNER
  // =====================================================

  owner: any = {

    customer_name: '',

    owner_mobile: '',

    owner_email: '',

    owner_address: '',

    owner_city: '',

    owner_state: '',

    owner_pincode: '',

    pan_number: ''

  };


  // =====================================================
  // INSPECTION
  // =====================================================

  inspection: any = {

    engine_remark: '',

    overall_remark: '',

    overall_score: null

  };


  // =====================================================
  // CHECKLIST
  // =====================================================

  checklist: any = {

    exterior: {

      status: 'Good',

      remark: ''

    },

    interior_electricals: {

      status: 'Good',

      remark: ''

    },

    engine_bay: {

      status: 'Good',

      remark: ''

    },

    transmission_system: {

      status: 'Good',

      remark: ''

    },

    suspension_steering: {

      status: 'Good',

      remark: ''

    },

    braking_system: {

      status: 'Good',

      remark: ''

    },

    tires_wheels: {

      status: 'Good',

      remark: ''

    },

    electricals_ac: {

      status: 'Good',

      remark: ''

    },

    documents_title: {

      status: 'Good',

      remark: ''

    }

  };


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get(
          'carId'
        )
      );

    if (!id) {

      this.errorMessage =
        'Invalid vehicle ID.';

      return;

    }

    this.carId = id;

    this.loadVehicle();

  }


  // =====================================================
  // GET VEHICLE
  // =====================================================

  loadVehicle(): void {

    this.loading = true;

    this.errorMessage = '';

    this.vehicleService
      .getVehicleById(this.carId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Edit Vehicle Response:',
            response
          );

          if (
            response.success
          ) {

            const data =
              response.data;


            // =========================================
            // VEHICLE
            // =========================================

            this.vehicle = {

              ...this.vehicle,

              ...(data.vehicle || {})

            };


            // =========================================
            // OWNER
            // =========================================

            this.owner = {

              ...this.owner,

              ...(data.owner || {})

            };


            // =========================================
            // INSPECTION
            // =========================================

            this.inspection = {

              ...this.inspection,

              ...(data.inspection || {})

            };


            // =========================================
            // CHECKLIST
            // =========================================

            if (
              data.checklist
            ) {

              this.checklist = {

                ...this.checklist,

                ...data.checklist

              };

            }

          } else {

            this.errorMessage =
              response.message ||
              'Unable to load vehicle.';

          }

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Load Vehicle Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load vehicle.';

          this.loading = false;

        }

      });

  }


  // =====================================================
  // UPDATE
  // =====================================================

  updateVehicle(): void {

    this.successMessage = '';

    this.errorMessage = '';


    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (
      !this.vehicle.brand?.trim() ||
      !this.vehicle.model?.trim()
    ) {

      this.errorMessage =
        'Brand and Model are required.';

      return;

    }


    this.saving = true;


    // =========================================
    // PAYLOAD
    // =========================================

    const payload = {

      ...this.vehicle,

      ...this.owner,

      engine_remark:
        this.inspection.engine_remark,

      overall_remark:
        this.inspection.overall_remark,

      overall_score:
        this.inspection.overall_score,

      inspection_checklist:
        this.checklist

    };


    console.log(
      'UPDATE VEHICLE PAYLOAD:',
      payload
    );


    // =========================================
    // API
    // =========================================

    this.vehicleService
      .updateVehicle(
        this.carId,
        payload
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Update Vehicle Response:',
            response
          );


          if (
            response.success
          ) {

            this.successMessage =
              response.message ||
              'Vehicle updated successfully.';

            this.saving = false;


            setTimeout(() => {

              this.router.navigate([
                '/admin/vehicles'
              ]);

            }, 1000);

          } else {

            this.errorMessage =
              response.message ||
              'Unable to update vehicle.';

            this.saving = false;

          }

        },

        error: (error) => {

          console.error(
            'Update Vehicle Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to update vehicle.';

          this.saving = false;

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/admin/vehicles'
    ]);

  }

}