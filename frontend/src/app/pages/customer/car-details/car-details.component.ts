import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

import {
  FormsModule
} from '@angular/forms';


// =====================================================
// VEHICLE IMAGE
// =====================================================

interface VehicleImage {

  image_id?: number;

  car_id?: number;

  image_type?: string;

  image_path?: string;

  is_primary?: number | boolean;

}


// =====================================================
// VEHICLE
// =====================================================

interface Vehicle {

  car_id: number;

  brand: string;

  model: string;

  variant?: string;

  manufacturing_year?: number;

  price?: number;

  odometer?: number;

  fuel_type?: string;

  transmission?: string;

  city?: string;

  location?: string;

  status?: string;

  listing_status?: string;

  published_at?: string;

  owner_classification?: string;

  owner_type?: string;

  ownership?: string;

  overall_score?: number;

  inspection_score?: number;

  score?: number;

  vin?: string;

  body_style?: string;

  drive_type?: string;

  engine?: string;

  exterior_color?: string;

  interior_color?: string;

  seats?: number;

  images?: VehicleImage[];

  car_images?: VehicleImage[];

  vehicle_images?: VehicleImage[];

}


// =====================================================
// API RESPONSE
// =====================================================

interface VehicleResponse {

  success?: boolean;

  message?: string;

  data?: {

    vehicle?: Vehicle;

    vehicles?: Vehicle[];

  };

  vehicle?: Vehicle;

  vehicles?: Vehicle[];

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-car-details',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    RouterLink

  ],

  templateUrl: './car-details.component.html'

})


export class CarDetailsComponent
  implements OnInit {


  // ===================================================
  // HTTP
  // ===================================================

  private http =
    inject(HttpClient);


  // ===================================================
  // ROUTE
  // ===================================================

  private route =
    inject(ActivatedRoute);


  // ===================================================
  // API
  // ===================================================

  private apiUrl =
    'http://localhost:5000/api';


  // ===================================================
  // VEHICLE
  // ===================================================

  vehicle =
    signal<Vehicle | null>(null);


  // ===================================================
  // LOADING
  // ===================================================

  loading =
    signal(true);


  // ===================================================
  // ERROR
  // ===================================================

  error =
    signal('');


  // ===================================================
  // ACTIVE TAB
  // ===================================================

  activeTab =
    signal<'price' | 'finance'>('price');


  // ===================================================
  // ACTIVE IMAGE
  // ===================================================

  activeImageIndex =
    signal(0);


  // ===================================================
  // FORM STATES
  // ===================================================

  showFinanceForm =
    signal(false);

  showTestDriveForm =
    signal(false);

  showInspectionForm =
    signal(false);


  // ===================================================
  // FORM SUBMISSION STATE
  // ===================================================

  submitting =
    signal(false);

  submitError =
    signal('');

  submitSuccess =
    signal('');


  // ===================================================
  // FINANCE FORM
  // ===================================================

  financeForm = {

    name: '',

    phone: '',

    email: '',

    monthlyIncome: '',

    employment: '',

    loanAmount: '',

    downPayment: ''

  };


  // ===================================================
  // TEST DRIVE FORM
  // ===================================================

  testDriveForm = {

    name: '',

    phone: '',

    email: '',

    date: '',

    time: '',

    location: ''

  };


  // ===================================================
  // INSPECTION FORM
  // ===================================================

  inspectionForm = {

    name: '',

    phone: '',

    email: ''

  };


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    const carId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    if (!carId) {

      this.error.set(
        'Invalid car ID.'
      );

      this.loading.set(false);

      return;

    }


    this.loadVehicle(carId);

  }


  // ===================================================
  // LOAD VEHICLE
  // ===================================================

  loadVehicle(
    carId: number
  ): void {

    this.loading.set(true);

    this.error.set('');


    this.http
      .get<VehicleResponse>(
        `${this.apiUrl}/vehicles/${carId}`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Vehicle Details API:',
            response
          );


          const selectedVehicle =
            this.extractVehicle(
              response,
              carId
            );


          if (selectedVehicle) {

            this.vehicle.set(
              selectedVehicle
            );

            this.activeImageIndex.set(0);

            this.loading.set(false);

          }

          else {

            this.loadFromPublishedVehicles(
              carId
            );

          }

        },


        error: (apiError) => {

          console.warn(
            'Vehicle details endpoint failed. Trying published vehicles...',
            apiError
          );


          this.loadFromPublishedVehicles(
            carId
          );

        }

      });

  }


  // ===================================================
  // FALLBACK
  // ===================================================

  private loadFromPublishedVehicles(
    carId: number
  ): void {

    this.http
      .get<VehicleResponse>(
        `${this.apiUrl}/vehicles/published`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Published Vehicles:',
            response
          );


          let vehicles: Vehicle[] = [];


          if (
            response?.data?.vehicles
          ) {

            vehicles =
              response.data.vehicles;

          }

          else if (
            response?.vehicles
          ) {

            vehicles =
              response.vehicles;

          }


          const selectedVehicle =
            vehicles.find(
              car =>
                Number(car.car_id) ===
                Number(carId)
            );


          if (selectedVehicle) {

            this.vehicle.set(
              selectedVehicle
            );

            this.activeImageIndex.set(0);

            this.error.set('');

            this.loading.set(false);

          }

          else {

            this.error.set(
              'Car details not found.'
            );

            this.loading.set(false);

          }

        },


        error: (apiError) => {

          console.error(
            'Published vehicle API error:',
            apiError
          );


          this.error.set(
            'Unable to load car details. Please check the backend API.'
          );


          this.loading.set(false);

        }

      });

  }


  // ===================================================
  // EXTRACT VEHICLE
  // ===================================================

  private extractVehicle(
    response: VehicleResponse,
    carId: number
  ): Vehicle | null {


    if (
      response?.data?.vehicle
    ) {

      return response.data.vehicle;

    }


    if (
      response?.vehicle
    ) {

      return response.vehicle;

    }


    if (
      response?.data?.vehicles?.length
    ) {

      return (

        response.data.vehicles.find(
          car =>
            Number(car.car_id) ===
            Number(carId)
        ) || null

      );

    }


    if (
      response?.vehicles?.length
    ) {

      return (

        response.vehicles.find(
          car =>
            Number(car.car_id) ===
            Number(carId)
        ) || null

      );

    }


    return null;

  }


  // ===================================================
  // GET IMAGES
  // ===================================================

  getImages(
    vehicle?: Vehicle | null
  ): VehicleImage[] {

    if (!vehicle) {

      return [];

    }


    if (
      vehicle.images &&
      vehicle.images.length
    ) {

      return vehicle.images;

    }


    if (
      vehicle.car_images &&
      vehicle.car_images.length
    ) {

      return vehicle.car_images;

    }


    if (
      vehicle.vehicle_images &&
      vehicle.vehicle_images.length
    ) {

      return vehicle.vehicle_images;

    }


    return [];

  }


  // ===================================================
  // IMAGE URL
  // ===================================================

  getImageUrl(
    image?: VehicleImage
  ): string {

    const imagePath =
      image?.image_path;


    if (!imagePath) {

      return this.getFallbackImage();

    }


    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://')
    ) {

      return imagePath;

    }


    return `http://localhost:5000${imagePath}`;

  }


  // ===================================================
  // FALLBACK IMAGE
  // ===================================================

  getFallbackImage(): string {

    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85';

  }


  // ===================================================
  // MAIN IMAGE
  // ===================================================

  getMainImage(): string {

    const currentVehicle =
      this.vehicle();


    const images =
      this.getImages(
        currentVehicle
      );


    if (!images.length) {

      return this.getFallbackImage();

    }


    const index =
      this.activeImageIndex() %
      images.length;


    return this.getImageUrl(
      images[index]
    );

  }


  // ===================================================
  // CHANGE IMAGE
  // ===================================================

  changeImage(
    index: number
  ): void {

    this.activeImageIndex.set(
      index
    );

  }


  // ===================================================
  // PREVIOUS IMAGE
  // ===================================================

  previousImage(): void {

    const images =
      this.getImages(
        this.vehicle()
      );


    if (!images.length) {

      return;

    }


    this.activeImageIndex.update(
      index => {

        if (index <= 0) {

          return images.length - 1;

        }

        return index - 1;

      }
    );

  }


  // ===================================================
  // NEXT IMAGE
  // ===================================================

  nextImage(): void {

    const images =
      this.getImages(
        this.vehicle()
      );


    if (!images.length) {

      return;

    }


    this.activeImageIndex.update(
      index =>
        (index + 1) %
        images.length
    );

  }


  // ===================================================
  // PRICE
  // ===================================================

  formatPrice(
    price?: number
  ): string {

    if (
      price === undefined ||
      price === null
    ) {

      return '₹0';

    }


    return new Intl.NumberFormat(
      'en-IN',
      {

        style: 'currency',

        currency: 'INR',

        maximumFractionDigits: 0

      }
    ).format(price);

  }


  // ===================================================
  // ODOMETER
  // ===================================================

  formatOdometer(
    odometer?: number
  ): string {

    if (
      odometer === undefined ||
      odometer === null
    ) {

      return '—';

    }


    return new Intl.NumberFormat(
      'en-IN'
    ).format(
      odometer
    );

  }


  // ===================================================
  // LISTING STATUS
  // ===================================================

  getListingStatus(
    vehicle?: Vehicle | null
  ): string {

    if (!vehicle) {

      return '—';

    }


    return (

      vehicle.listing_status ||

      vehicle.status ||

      '—'

    );

  }


  // ===================================================
  // PUBLISHED
  // ===================================================

  isPublished(
    vehicle?: Vehicle | null
  ): boolean {

    if (!vehicle) {

      return false;

    }


    const status =
      vehicle.listing_status ||
      vehicle.status ||
      '';


    return (

      status
        .toLowerCase()
        .trim() === 'published'

    );

  }


  // ===================================================
  // OVERALL SCORE
  // ===================================================

  getOverallScore(
    vehicle?: Vehicle | null
  ): string {

    if (!vehicle) {

      return '—';

    }


    const score =
      vehicle.overall_score ??
      vehicle.inspection_score ??
      vehicle.score;


    if (
      score === undefined ||
      score === null
    ) {

      return '—';

    }


    return `${score}/10`;

  }


  // ===================================================
  // OWNER CLASSIFICATION
  // ===================================================

  getOwnerClassification(
    vehicle?: Vehicle | null
  ): string {

    if (!vehicle) {

      return '—';

    }


    return (

      vehicle.owner_classification ||

      vehicle.owner_type ||

      vehicle.ownership ||

      '—'

    );

  }


  // ===================================================
  // LOCATION
  // ===================================================

  getLocation(
    vehicle?: Vehicle | null
  ): string {

    if (!vehicle) {

      return '—';

    }


    return (

      vehicle.location ||

      vehicle.city ||

      '—'

    );

  }


  // ===================================================
  // FINANCE
  // ===================================================

  openFinance(): void {

    this.activeTab.set(
      'finance'
    );

    this.showFinanceForm.set(
      true
    );

  }


  closeFinance(): void {

    this.showFinanceForm.set(
      false
    );

    this.activeTab.set(
      'price'
    );

  }


  // ===================================================
  // TEST DRIVE
  // ===================================================

  openTestDrive(): void {

    this.showTestDriveForm.set(
      true
    );

  }


  closeTestDrive(): void {

    this.showTestDriveForm.set(
      false
    );

  }


  // ===================================================
  // INSPECTION
  // ===================================================

  openInspection(): void {

    this.showInspectionForm.set(
      true
    );

  }


  closeInspection(): void {

    this.showInspectionForm.set(
      false
    );

  }


  // ===================================================
// FINANCE SUBMIT
// ===================================================

submitFinance(): void {

  const vehicle = this.vehicle();

  if (!vehicle?.car_id) {
    alert('Vehicle information is not available.');
    return;
  }

  if (
    !this.financeForm.name.trim() ||
    !this.financeForm.phone.trim() ||
    !this.financeForm.email.trim()
  ) {
    alert('Please fill Name, Phone and Email.');
    return;
  }

  this.submitting.set(true);
  this.submitError.set('');
  this.submitSuccess.set('');

  const payload = {
    ...this.financeForm,

    carId: vehicle.car_id,

    customerName: this.financeForm.name,
    customerPhone: this.financeForm.phone,
    customerEmail: this.financeForm.email
  };

  console.log('Finance Payload:', payload);

  this.http
    .post(
      `${this.apiUrl}/vehicles/${vehicle.car_id}/finance`,
      payload
    )
    .subscribe({

      next: (response: any) => {

        console.log(
          'Finance Request Saved:',
          response
        );

        this.submitting.set(false);

        this.submitSuccess.set(
          'Finance request submitted successfully.'
        );

        alert(
          'Finance details submitted successfully.'
        );

        this.showFinanceForm.set(false);

      },

      error: (error) => {

        console.error(
          'Finance Request Error:',
          error
        );

        this.submitting.set(false);

        const message =
          error?.error?.message ||
          'Unable to submit finance request.';

        this.submitError.set(message);

        alert(message);

      }

    });

}


// ===================================================
// TEST DRIVE SUBMIT
// ===================================================

submitTestDrive(): void {

  const vehicle = this.vehicle();

  if (!vehicle?.car_id) {
    alert('Vehicle information is not available.');
    return;
  }

  if (
    !this.testDriveForm.name.trim() ||
    !this.testDriveForm.phone.trim() ||
    !this.testDriveForm.email.trim() ||
    !this.testDriveForm.date ||
    !this.testDriveForm.time
  ) {

    alert(
      'Please fill all required test drive details.'
    );

    return;
  }

  this.submitting.set(true);
  this.submitError.set('');
  this.submitSuccess.set('');

  const payload = {

    ...this.testDriveForm,

    carId: vehicle.car_id,

    customerName:
      this.testDriveForm.name,

    customerPhone:
      this.testDriveForm.phone,

    customerEmail:
      this.testDriveForm.email,

    preferredDate:
      this.testDriveForm.date,

    preferredTime:
      this.testDriveForm.time,

    preferredLocation:
      this.testDriveForm.location

  };

  console.log(
    'Test Drive Payload:',
    payload
  );

  this.http
    .post(
      `${this.apiUrl}/vehicles/${vehicle.car_id}/test-drive`,
      payload
    )
    .subscribe({

      next: (response: any) => {

        console.log(
          'Test Drive Request Saved:',
          response
        );

        this.submitting.set(false);

        this.submitSuccess.set(
          'Test drive request submitted successfully.'
        );

        alert(
          'Test drive request submitted successfully.'
        );

        this.showTestDriveForm.set(false);

      },

      error: (error) => {

        console.error(
          'Test Drive Request Error:',
          error
        );

        this.submitting.set(false);

        const message =
          error?.error?.message ||
          'Unable to submit test drive request.';

        this.submitError.set(message);

        alert(message);

      }

    });

}


// ===================================================
// INSPECTION SUBMIT
// ===================================================

submitInspection(): void {

  const vehicle = this.vehicle();

  if (!vehicle?.car_id) {

    alert(
      'Vehicle information is not available.'
    );

    return;
  }

  if (
    !this.inspectionForm.name.trim() ||
    !this.inspectionForm.phone.trim() ||
    !this.inspectionForm.email.trim()
  ) {

    alert(
      'Please fill Name, Phone and Email.'
    );

    return;
  }

  this.submitting.set(true);
  this.submitError.set('');
  this.submitSuccess.set('');

  const payload = {

    ...this.inspectionForm,

    carId: vehicle.car_id,

    customerName:
      this.inspectionForm.name,

    customerPhone:
      this.inspectionForm.phone,

    customerEmail:
      this.inspectionForm.email

  };

  console.log(
    'Inspection Payload:',
    payload
  );

  this.http
    .post(
      `${this.apiUrl}/vehicles/${vehicle.car_id}/unlock-report`,
      payload
    )
    .subscribe({

      next: (response: any) => {

        console.log(
          'Inspection Unlock Request Saved:',
          response
        );

        this.submitting.set(false);

        this.submitSuccess.set(
          'Inspection report request submitted successfully.'
        );

        alert(
          'Inspection report request submitted successfully.'
        );

        this.showInspectionForm.set(false);

      },

      error: (error) => {

        console.error(
          'Inspection Unlock Request Error:',
          error
        );

        this.submitting.set(false);

        const message =
          error?.error?.message ||
          'Unable to submit inspection report request.';

        this.submitError.set(message);

        alert(message);

      }

    });

}


  // ===================================================
  // CLOSE ALL
  // ===================================================

  closeAllForms(): void {

    this.showFinanceForm.set(false);

    this.showTestDriveForm.set(false);

    this.showInspectionForm.set(false);

  }

}