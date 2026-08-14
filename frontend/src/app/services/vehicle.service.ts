import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


export interface Vehicle {

  car_id: number;

  owner_id?: number;

  brand: string;

  model: string;

  variant?: string;

  manufacturing_year?: number;

  price?: number;

  price_short_note?: string;

  odometer?: number;

  fuel_type?: string;

  transmission?: string;

  owner_classification?: string;

  registration_number?: string;

  chassis_number?: string;

  engine_number?: string;

  city?: string;

  inspection_date?: string;

  rto?: string;

  spare_key?: string;

  insurance_type?: string;

  insurance_validity?: string;

  vehicle_note?: string;

  status?: string;

  created_at?: string;

  updated_at?: string;

  published_at?: string;

}


export interface VehicleResponse {

  success: boolean;

  message: string;

  data: {

    vehicleId?: number;

    reportId?: number;

    vehicles?: Vehicle[];

    vehicle?: Vehicle;

    owner?: any;

    inspection?: any;

    checklist?: any;

    reports?: any[];

    pagination?: {

      page: number;

      limit: number;

      total: number;

      totalPages: number;

    };

    message?: string;

  };

}


@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private http =
    inject(HttpClient);


  // =====================================================
  // API URL
  // =====================================================

  private apiUrl =
    'http://localhost:5000/api';


  // =====================================================
  // GET ALL VEHICLES
  // =====================================================

  getVehicles():
    Observable<any> {

    return this.http.get(
      `${this.apiUrl}/admin/vehicles`
    );

  }


  // =====================================================
  // ADD VEHICLE
  // =====================================================

  addVehicle(
    vehicle: any
  ):
    Observable<any> {

    return this.http.post(
      `${this.apiUrl}/admin/vehicles`,
      vehicle
    );

  }


  // =====================================================
  // UPLOAD VEHICLE IMAGES
  // =====================================================

  uploadVehicleImages(

    carId: number,

    images: {

      type: string;

      file: File | null;

      preview: string;

    }[]

  ):
    Observable<any> {

    const formData =
      new FormData();


    let fileIndex =
      0;


    images.forEach(
      image => {

        if (!image.file) {

          return;

        }


        formData.append(
          'images',
          image.file
        );


        formData.append(
          `imageType_${fileIndex}`,
          image.type
        );


        fileIndex++;

      }
    );


    return this.http.post(

      `${this.apiUrl}/admin/vehicles/${carId}/images`,

      formData

    );

  }


  // =====================================================
  // GET SINGLE VEHICLE
  // =====================================================

  getVehicleById(
    carId: number
  ):
    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/vehicles/${carId}`

    );

  }


  // =====================================================
  // UPDATE VEHICLE
  // =====================================================

  updateVehicle(

    carId: number,

    vehicle: any

  ):
    Observable<any> {

    return this.http.put(

      `${this.apiUrl}/admin/vehicles/${carId}`,

      vehicle

    );

  }


  // =====================================================
  // GET ALL INSPECTION REPORTS
  // =====================================================

  getReports():
    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/inspection-reports`

    );

  }


  // =====================================================
  // GENERATE ADMIN INSPECTION REPORT PDF
  // =====================================================

  generateInspectionReportPdf(

    reportId: number

  ):
    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/inspection-reports/${reportId}/pdf`

    );

  }


  // =====================================================
  // SEND INSPECTION REPORT TO CUSTOMER EMAIL
  // =====================================================

  sendInspectionReportEmail(

    reportId: number,

    customerEmail: string

  ):
    Observable<any> {

    return this.http.post(

      `${this.apiUrl}/admin/inspection-reports/${reportId}/send-email`,

      {
        customerEmail
      }

    );

  }


  // =====================================================
  // SEND PDF TO CUSTOMER
  // Alias method
  // =====================================================

  sendCustomerPdf(

    reportId: number,

    customerEmail: string

  ):
    Observable<any> {

    return this.sendInspectionReportEmail(

      reportId,

      customerEmail

    );

  }

}