export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
export type HousekeepingStatus = 'clean' | 'dirty' | 'inspecting' | 'out_of_order';
export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type BookingSource = 'direct' | 'walk_in' | 'booking_com' | 'makemytrip' | 'agoda' | 'corporate';

export interface RoomType {
  id: string;
  name: string;
  code: string;
  basePrice: number;
  capacityAdults: number;
  capacityChildren: number;
  bedType: string;
  sizeSqm: number;
  description: string;
  amenities: string[];
  imageUrl: string;
}

export interface HotelRoom {
  id: string;
  number: string;
  floor: number;
  roomTypeId: string;
  roomType?: RoomType;
  status: RoomStatus;
  housekeepingStatus: HousekeepingStatus;
  currentReservationId?: string;
  currentGuestName?: string;
  notes?: string;
}

export interface FolioItem {
  id: string;
  date: string;
  description: string;
  category: 'room' | 'restaurant' | 'minibar' | 'laundry' | 'spa' | 'tax' | 'other';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface FolioPayment {
  id: string;
  date: string;
  amount: number;
  method: 'cash' | 'credit_card' | 'stripe' | 'upi' | 'bank_transfer';
  reference?: string;
}

export interface HotelFolio {
  id: string;
  reservationId: string;
  folioNumber: string;
  guestName: string;
  roomNumber: string;
  items: FolioItem[];
  payments: FolioPayment[];
  totalCharges: number;
  totalPaid: number;
  balanceDue: number;
  isClosed: boolean;
  odooInvoiceId?: number;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identityType?: 'passport' | 'national_id' | 'driving_license';
  identityNumber?: string;
  vip: boolean;
  notes?: string;
}

export interface Reservation {
  id: string;
  bookingCode: string;
  source: BookingSource;
  guest: Guest;
  roomId: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  adults: number;
  children: number;
  status: ReservationStatus;
  totalAmount: number;
  depositPaid: number;
  specialRequests?: string;
  createdAt: string;
}

export interface DashboardStats {
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  todayRevenue: number;
  pendingOTABookings: number;
}
