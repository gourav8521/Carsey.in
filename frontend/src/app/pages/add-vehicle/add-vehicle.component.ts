import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  VehicleService
} from '../../services/vehicle.service';


@Component({

  selector: 'app-add-vehicle',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './add-vehicle.component.html',

  styleUrl:
    './add-vehicle.component.css'

})
export class AddVehicleComponent {


  private vehicleService =
    inject(VehicleService);


  private router =
    inject(Router);


  // ==========================================
  // LOADING / MESSAGES
  // ==========================================

  loading = false;

  successMessage = '';

  errorMessage = '';


  // ==========================================
  // CUSTOMER COMMUNICATION
  // ==========================================

  showCustomerCommunication =
    false;


  publishedVehicleId:
    number | null = null;


  publishedReportId:
    number | null = null;


  customerEmail =
    '';


  customerWhatsApp =
    '';


  sendingCustomerEmail =
    false;


  customerEmailSuccess =
    '';


  customerEmailError =
    '';


  // ==========================================
  // VEHICLE BASIC INFORMATION
  // ==========================================

  vehicle = {

    brand: '',

    model: '',

    variant: '',

    manufacturing_year:
      new Date().getFullYear(),

    price:
      null as number | null,

    odometer:
      null as number | null,

    city: '',

    transmission:
      'Manual',

    fuel_type:
      'Petrol',

    owner_classification:
      'First',

    registration_number: '',

    chassis_number: '',

    engine_number: '',

    inspection_date: '',

    rto: '',

    spare_key:
      'Yes',

    insurance_type: '',

    insurance_validity: '',

    vehicle_note: '',

    status:
      'Draft'

  };


  // ==========================================
  // SHORT REMARKS
  // ==========================================

  variant_short_note =
    '';

  registration_rto_short_note =
    '';

  price_short_note =
    '';


  // ==========================================
  // CUSTOMER DETAILS
  // ==========================================

  customer_name =
    '';

  owner_mobile =
    '';

  alternate_mobile =
    '';

  owner_email =
    '';

  owner_address =
    '';

  owner_city =
    '';

  owner_state =
    '';

  owner_pincode =
    '';

  aadhar_number =
    '';

  pan_number =
    '';


  // ==========================================
  // INSPECTION CHECKLIST
  // ==========================================

  checklist = {

    exterior: {

      status:
        'Good',

      remark:
        ''

    },

    interior_electricals: {

      status:
        'Good',

      remark:
        ''

    },

    engine_bay: {

      status:
        'Good',

      remark:
        ''

    },

    transmission_system: {

      status:
        'Good',

      remark:
        ''

    },

    suspension_steering: {

      status:
        'Good',

      remark:
        ''

    },

    braking_system: {

      status:
        'Good',

      remark:
        ''

    },

    tires_wheels: {

      status:
        'Good',

      remark:
        ''

    },

    electricals_ac: {

      status:
        'Good',

      remark:
        ''

    },

    documents_title: {

      status:
        'Good',

      remark:
        ''

    }

  };


  // ==========================================
  // ENGINE / OVERALL REMARKS
  // ==========================================

  engine_remark =
    '';

  overall_remark =
    '';


  // ==========================================
  // OVERALL SCORE
  // ==========================================

  overall_score =
    9.2;


  // ==========================================
  // IMAGE FILES
  // ==========================================

  imageFiles: {

    type: string;

    file: File | null;

    preview: string;

  }[] = [

    {
      type: 'Front',
      file: null,
      preview: ''
    },

    {
      type: 'Back',
      file: null,
      preview: ''
    },

    {
      type: 'Right',
      file: null,
      preview: ''
    },

    {
      type: 'Left',
      file: null,
      preview: ''
    },

    {
      type: 'Other',
      file: null,
      preview: ''
    },

    {
      type: 'Interior',
      file: null,
      preview: ''
    },

    {
      type: 'Interior',
      file: null,
      preview: ''
    },

    {
      type: 'Dashboard',
      file: null,
      preview: ''
    }

  ];


  // ==========================================
  // IMAGE LABELS
  // ==========================================

  imageLabels = [

    'Exterior Front Side',

    'Exterior Back Side',

    'Exterior Right Side',

    'Exterior Left Side',

    'Trunk / Hatch',

    'Interior Front View',

    'Interior Rear View',

    'Odometer Reading'

  ];


  // ==========================================
  // SELECT IMAGE
  // ==========================================

  onImageSelected(

    event: Event,

    index: number

  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    this.imageFiles[index].file =
      file;


    this.imageFiles[index].preview =
      URL.createObjectURL(file);

  }


  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  removeImage(
    index: number
  ): void {

    this.imageFiles[index].file =
      null;

    this.imageFiles[index].preview =
      '';

  }


  // ==========================================
  // SCORE
  // ==========================================

  get scoreDisplay(): string {

    return Number(
      this.overall_score
    )
      .toFixed(1);

  }


  // ==========================================
  // SUBMIT VEHICLE
  // ==========================================

  submitVehicle(): void {

    this.successMessage =
      '';

    this.errorMessage =
      '';

    this.customerEmailSuccess =
      '';

    this.customerEmailError =
      '';


    // ========================================
    // VALIDATION
    // ========================================

    if (

      !this.vehicle.brand.trim() ||

      !this.vehicle.model.trim() ||

      !this.vehicle.manufacturing_year ||

      !this.vehicle.price ||

      !this.vehicle.city.trim()

    ) {

      this.errorMessage =
        'Please fill all required vehicle fields.';


      window.scrollTo({

        top: 0,

        behavior: 'smooth'

      });


      return;

    }


    this.loading =
      true;


    // ========================================
    // PAYLOAD
    // ========================================

    const payload = {

      ...this.vehicle,


      customer_name:
        this.customer_name,


      owner_mobile:
        this.owner_mobile,


      alternate_mobile:
        this.alternate_mobile,


      owner_email:
        this.owner_email,


      owner_address:
        this.owner_address,


      owner_city:
        this.owner_city,


      owner_state:
        this.owner_state,


      owner_pincode:
        this.owner_pincode,


      aadhar_number:
        this.aadhar_number,


      pan_number:
        this.pan_number,


      variant_short_note:
        this.variant_short_note,


      registration_rto_short_note:
        this.registration_rto_short_note,


      price_short_note:
        this.price_short_note,


      engine_remark:
        this.engine_remark,


      overall_remark:
        this.overall_remark,


      overall_score:
        this.overall_score,


      inspection_checklist:
        this.checklist

    };


    console.log(
      'ADD VEHICLE PAYLOAD:',
      payload
    );


    // ========================================
    // STEP 1:
    // ADD VEHICLE + INSPECTION
    // ========================================

    this.vehicleService

      .addVehicle(payload)

      .subscribe({

        next:
          (response: any) => {


            console.log(
              'Add Vehicle Response:',
              response
            );


            if (
              !response?.success
            ) {

              this.errorMessage =
                response?.message ||
                'Unable to add vehicle.';


              this.loading =
                false;


              return;

            }


            // ==================================
            // GET VEHICLE ID
            // ==================================

            const vehicleId =
              response?.data?.vehicleId;


            // ==================================
            // GET REPORT ID
            // ==================================

            const reportId =
              response?.data?.reportId;


            if (!vehicleId) {

              this.errorMessage =
                'Vehicle was created but vehicle ID was not returned by the server.';


              this.loading =
                false;


              return;

            }


            // ==================================
            // STORE IDs
            // ==================================

            this.publishedVehicleId =
              vehicleId;


            this.publishedReportId =
              reportId || null;


            // ==================================
            // AUTO FILL CUSTOMER DETAILS
            // ==================================

            this.customerEmail =
              this.owner_email.trim();


            this.customerWhatsApp =
              this.owner_mobile.trim();


            // ==================================
            // SELECTED IMAGES
            // ==================================

            const selectedImages =
              this.imageFiles.filter(
                image =>
                  !!image.file
              );


            // ==================================
            // NO IMAGES
            // ==================================

            if (
              selectedImages.length === 0
            ) {


              this.successMessage =
                response?.message ||
                'Vehicle published successfully.';


              this.loading =
                false;


              // ==================================
              // SHOW CUSTOMER COMMUNICATION
              // ==================================

              this.showCustomerCommunication =
                true;


              window.scrollTo({

                top: document.body.scrollHeight,

                behavior: 'smooth'

              });


              return;

            }


            // ==================================
            // STEP 2:
            // UPLOAD IMAGES
            // ==================================

            this.vehicleService

              .uploadVehicleImages(

                vehicleId,

                selectedImages

              )

              .subscribe({

                next:
                  (
                    imageResponse: any
                  ) => {


                    console.log(

                      'Vehicle Images Response:',

                      imageResponse

                    );


                    if (
                      !imageResponse?.success
                    ) {

                      this.errorMessage =
                        imageResponse?.message ||
                        'Vehicle was added, but images could not be uploaded.';


                      this.loading =
                        false;


                      return;

                    }


                    // =========================
                    // SUCCESS
                    // =========================

                    this.successMessage =
                      'Vehicle, inspection, checklist and images published successfully.';


                    this.loading =
                      false;


                    // =========================
                    // SHOW CUSTOMER PANEL
                    // =========================

                    this.showCustomerCommunication =
                      true;


                    // =========================
                    // SCROLL TO PANEL
                    // =========================

                    setTimeout(() => {

                      window.scrollTo({

                        top:
                          document.body.scrollHeight,

                        behavior:
                          'smooth'

                      });

                    }, 100);

                  },


                error:
                  (
                    imageError
                  ) => {


                    console.error(

                      'Vehicle Image Upload Error:',

                      imageError

                    );


                    this.errorMessage =
                      imageError?.error?.message ||
                      'Vehicle was added, but images could not be uploaded.';


                    this.loading =
                      false;


                    window.scrollTo({

                      top: 0,

                      behavior: 'smooth'

                    });

                  }

              });

          },


        error:
          (error) => {


            console.error(

              'Add Vehicle Error:',

              error

            );


            this.errorMessage =
              error?.error?.message ||
              'Unable to add vehicle.';


            this.loading =
              false;


            window.scrollTo({

              top: 0,

              behavior: 'smooth'

            });

          }

      });

  }


  // ==========================================
  // SEND PDF TO CUSTOMER EMAIL
  // ==========================================

  sendCustomerEmail(): void {


    // ========================================
    // REPORT ID CHECK
    // ========================================

    if (
      !this.publishedReportId
    ) {

      this.customerEmailError =
        'Inspection report ID is missing.';

      return;

    }


    // ========================================
    // EMAIL
    // ========================================

    const email =
      this.customerEmail
        .trim()
        .toLowerCase();


    if (!email) {

      this.customerEmailError =
        'Please enter customer email.';


      this.customerEmailSuccess =
        '';


      return;

    }


    // ========================================
    // EMAIL VALIDATION
    // ========================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(email)
    ) {

      this.customerEmailError =
        'Please enter a valid customer email.';


      this.customerEmailSuccess =
        '';


      return;

    }


    // ========================================
    // START
    // ========================================

    this.sendingCustomerEmail =
      true;


    this.customerEmailError =
      '';


    this.customerEmailSuccess =
      '';


    // ========================================
    // API
    // ========================================

    this.vehicleService

      .sendInspectionReportEmail(

        this.publishedReportId,

        email

      )

      .subscribe({

        // ====================================
        // SUCCESS
        // ====================================

        next:
          (response: any) => {


            console.log(

              'Customer PDF Email Response:',

              response

            );


            this.sendingCustomerEmail =
              false;


            if (
              response?.success
            ) {

              this.customerEmailSuccess =
                response?.message ||
                'Inspection PDF sent successfully to customer email.';

            } else {

              this.customerEmailError =
                response?.message ||
                'Unable to send PDF to customer.';

            }

          },


        // ====================================
        // ERROR
        // ====================================

        error:
          (error: any) => {


            console.error(

              'Customer PDF Email Error:',

              error

            );


            this.sendingCustomerEmail =
              false;


            this.customerEmailError =
              error?.error?.message ||
              error?.message ||
              'Unable to send PDF to customer email.';

          }

      });

  }


  // ==========================================
  // OPEN WHATSAPP
  // ==========================================

  sendCustomerWhatsApp(): void {

    const phone =
      this.customerWhatsApp
        .replace(/\D/g, '');


    if (!phone) {

      return;

    }


    const message =
      `Hello ${this.customer_name || 'Customer'}, your vehicle inspection report from Carsey.in is ready. Please find the inspection report PDF.`;


    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;


    window.open(

      whatsappUrl,

      '_blank'

    );

  }


  // ==========================================
  // RESET
  // ==========================================

  resetForm(): void {


    this.vehicle = {

      brand: '',

      model: '',

      variant: '',

      manufacturing_year:
        new Date().getFullYear(),

      price:
        null,

      odometer:
        null,

      city: '',

      transmission:
        'Manual',

      fuel_type:
        'Petrol',

      owner_classification:
        'First',

      registration_number: '',

      chassis_number: '',

      engine_number: '',

      inspection_date: '',

      rto: '',

      spare_key:
        'Yes',

      insurance_type: '',

      insurance_validity: '',

      vehicle_note: '',

      status:
        'Draft'

    };


    this.customer_name =
      '';

    this.owner_mobile =
      '';

    this.alternate_mobile =
      '';

    this.owner_email =
      '';

    this.owner_address =
      '';

    this.owner_city =
      '';

    this.owner_state =
      '';

    this.owner_pincode =
      '';

    this.aadhar_number =
      '';

    this.pan_number =
      '';


    this.variant_short_note =
      '';

    this.registration_rto_short_note =
      '';

    this.price_short_note =
      '';


    this.engine_remark =
      '';

    this.overall_remark =
      '';


    this.overall_score =
      9.2;


    this.customerEmail =
      '';

    this.customerWhatsApp =
      '';


    this.publishedVehicleId =
      null;

    this.publishedReportId =
      null;


    this.showCustomerCommunication =
      false;


    this.sendingCustomerEmail =
      false;


    this.customerEmailSuccess =
      '';

    this.customerEmailError =
      '';


    this.checklist = {

      exterior: {

        status:
          'Good',

        remark:
          ''

      },

      interior_electricals: {

        status:
          'Good',

        remark:
          ''

      },

      engine_bay: {

        status:
          'Good',

        remark:
          ''

      },

      transmission_system: {

        status:
          'Good',

        remark:
          ''

      },

      suspension_steering: {

        status:
          'Good',

        remark:
          ''

      },

      braking_system: {

        status:
          'Good',

        remark:
          ''

      },

      tires_wheels: {

        status:
          'Good',

        remark:
          ''

      },

      electricals_ac: {

        status:
          'Good',

        remark:
          ''

      },

      documents_title: {

        status:
          'Good',

        remark:
          ''

      }

    };


    this.imageFiles.forEach(

      image => {

        image.file =
          null;

        image.preview =
          '';

      }

    );


    this.successMessage =
      '';

    this.errorMessage =
      '';

  }


  // ==========================================
  // CANCEL
  // ==========================================

  cancel(): void {

    this.router.navigate([

      '/admin/vehicles'

    ]);

  }

}