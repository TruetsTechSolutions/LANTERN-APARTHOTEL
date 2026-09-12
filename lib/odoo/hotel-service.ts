import { INITIAL_ROOMS, INITIAL_ROOM_TYPES, INITIAL_RESERVATIONS, INITIAL_FOLIOS } from './mock-data';
import { HotelRoom, RoomType, Reservation, HotelFolio, DashboardStats, HousekeepingStatus, RoomStatus, FolioItem, FolioPayment } from './types';
import { odooClient } from './client';

// In-memory active store for demo / development mode
let activeRooms: HotelRoom[] = JSON.parse(JSON.stringify(INITIAL_ROOMS));
let activeReservations: Reservation[] = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));
let activeFolios: HotelFolio[] = JSON.parse(JSON.stringify(INITIAL_FOLIOS));

export const hotelService = {
  isMockMode(): boolean {
    return process.env.ODOO_MOCK_MODE !== 'false';
  },

  /**
   * Get all room types
   */
  async getRoomTypes(): Promise<RoomType[]> {
    if (this.isMockMode()) {
      return INITIAL_ROOM_TYPES;
    }

    try {
      const records = await odooClient.searchRead<any>('hotel.room.type', [], [
        'id', 'name', 'code', 'list_price', 'capacity_adults', 'capacity_children',
        'bed_type', 'size_sqm', 'description', 'image_url'
      ]);

      return records.map((r) => ({
        id: String(r.id),
        name: r.name,
        code: r.code || 'STD',
        basePrice: r.list_price || 100,
        capacityAdults: r.capacity_adults || 2,
        capacityChildren: r.capacity_children || 1,
        bedType: r.bed_type || '1 King Bed',
        sizeSqm: r.size_sqm || 30,
        description: r.description || '',
        amenities: ['Wi-Fi', 'TV', 'Ensuite'],
        imageUrl: r.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427',
      }));
    } catch (err) {
      console.warn('Falling back to mock room types due to Odoo error:', err);
      return INITIAL_ROOM_TYPES;
    }
  },

  /**
   * Get all rooms with room type details attached
   */
  async getRooms(): Promise<HotelRoom[]> {
    const roomTypes = await this.getRoomTypes();
    const typeMap = new Map(roomTypes.map((rt) => [rt.id, rt]));

    if (this.isMockMode()) {
      return activeRooms.map((room) => ({
        ...room,
        roomType: typeMap.get(room.roomTypeId),
      }));
    }

    try {
      const records = await odooClient.searchRead<any>('hotel.room', [], [
        'id', 'name', 'floor', 'room_type_id', 'status', 'housekeeping_status', 'notes'
      ]);

      return records.map((r) => ({
        id: String(r.id),
        number: r.name,
        floor: r.floor || 1,
        roomTypeId: String(r.room_type_id ? r.room_type_id[0] : 'rt-classic'),
        roomType: typeMap.get(String(r.room_type_id ? r.room_type_id[0] : 'rt-classic')),
        status: (r.status as RoomStatus) || 'available',
        housekeepingStatus: (r.housekeeping_status as HousekeepingStatus) || 'clean',
        notes: r.notes || '',
      }));
    } catch (err) {
      console.warn('Falling back to mock rooms due to Odoo error:', err);
      return activeRooms.map((room) => ({
        ...room,
        roomType: typeMap.get(room.roomTypeId),
      }));
    }
  },

  /**
   * Get all reservations
   */
  async getReservations(): Promise<Reservation[]> {
    if (this.isMockMode()) {
      return activeReservations;
    }

    try {
      const records = await odooClient.searchRead<any>('hotel.reservation', [], [], 100, 'id desc');
      return records.map((r) => ({
        id: String(r.id),
        bookingCode: r.name || `RES-${r.id}`,
        source: r.source_channel || 'direct',
        guest: {
          id: String(r.partner_id ? r.partner_id[0] : 'g-1'),
          firstName: r.partner_id ? r.partner_id[1].split(' ')[0] : 'Guest',
          lastName: r.partner_id ? r.partner_id[1].split(' ').slice(1).join(' ') : '',
          email: r.guest_email || '',
          phone: r.guest_phone || '',
          identityType: r.id_type || 'passport',
          identityNumber: r.id_number || '',
          vip: !!r.is_vip,
        },
        roomId: String(r.room_id ? r.room_id[0] : ''),
        roomNumber: r.room_id ? r.room_id[1] : '',
        roomTypeId: String(r.room_type_id ? r.room_type_id[0] : ''),
        roomTypeName: r.room_type_id ? r.room_type_id[1] : '',
        checkInDate: r.checkin_date || '',
        checkOutDate: r.checkout_date || '',
        nights: r.nights || 1,
        adults: r.adults || 2,
        children: r.children || 0,
        status: r.state || 'confirmed',
        totalAmount: r.total_cost || 0,
        depositPaid: r.deposit_paid || 0,
        specialRequests: r.special_requests || '',
        createdAt: r.create_date || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Falling back to mock reservations:', err);
      return activeReservations;
    }
  },

  /**
   * Get all folios or a single folio by reservation ID
   */
  async getFolio(reservationId: string): Promise<HotelFolio | undefined> {
    return activeFolios.find((f) => f.reservationId === reservationId);
  },

  async getAllFolios(): Promise<HotelFolio[]> {
    return activeFolios;
  },

  /**
   * Perform Express Check-In
   */
  async checkIn(reservationId: string): Promise<{ success: boolean; message: string }> {
    const res = activeReservations.find((r) => r.id === reservationId);
    if (!res) return { success: false, message: 'Reservation not found' };

    res.status = 'checked_in';

    const room = activeRooms.find((r) => r.id === res.roomId || r.number === res.roomNumber);
    if (room) {
      room.status = 'occupied';
      room.currentGuestName = `${res.guest.firstName} ${res.guest.lastName}`;
      room.currentReservationId = res.id;
    }

    return { success: true, message: `Guest ${res.guest.firstName} checked into Room ${res.roomNumber}` };
  },

  /**
   * Perform Express Check-Out
   */
  async checkOut(reservationId: string): Promise<{ success: boolean; message: string }> {
    const res = activeReservations.find((r) => r.id === reservationId);
    if (!res) return { success: false, message: 'Reservation not found' };

    res.status = 'checked_out';

    const room = activeRooms.find((r) => r.id === res.roomId || r.number === res.roomNumber);
    if (room) {
      room.status = 'cleaning';
      room.housekeepingStatus = 'dirty';
      room.currentGuestName = undefined;
      room.currentReservationId = undefined;
    }

    const folio = activeFolios.find((f) => f.reservationId === reservationId);
    if (folio) {
      folio.isClosed = true;
    }

    return { success: true, message: `Room ${res.roomNumber} checked out. Marked for housekeeping.` };
  },

  /**
   * Update Housekeeping Status
   */
  async updateHousekeeping(roomId: string, status: HousekeepingStatus): Promise<boolean> {
    const room = activeRooms.find((r) => r.id === roomId);
    if (!room) return false;

    room.housekeepingStatus = status;
    if (status === 'clean' && room.status === 'cleaning') {
      room.status = 'available';
    } else if (status === 'out_of_order') {
      room.status = 'maintenance';
    } else if (status === 'dirty' && room.status === 'available') {
      room.status = 'cleaning';
    }
    return true;
  },

  /**
   * Add charge item to Folio (mini-bar, restaurant, spa, etc.)
   */
  async addChargeToFolio(reservationId: string, item: Omit<FolioItem, 'id' | 'total'>): Promise<HotelFolio | null> {
    let folio = activeFolios.find((f) => f.reservationId === reservationId);
    const reservation = activeReservations.find((r) => r.id === reservationId);

    if (!folio && reservation) {
      folio = {
        id: `fol-${Date.now()}`,
        reservationId: reservation.id,
        folioNumber: `FOL-${Date.now().toString().slice(-6)}`,
        guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        roomNumber: reservation.roomNumber,
        items: [],
        payments: [],
        totalCharges: 0,
        totalPaid: 0,
        balanceDue: 0,
        isClosed: false,
      };
      activeFolios.push(folio);
    }

    if (!folio) return null;

    const total = item.quantity * item.unitPrice;
    const newItem: FolioItem = {
      ...item,
      id: `fi-${Date.now()}`,
      total,
    };

    folio.items.push(newItem);
    folio.totalCharges += total;
    folio.balanceDue = folio.totalCharges - folio.totalPaid;

    return folio;
  },

  /**
   * Record payment on Folio
   */
  async addPaymentToFolio(reservationId: string, payment: Omit<FolioPayment, 'id'>): Promise<HotelFolio | null> {
    const folio = activeFolios.find((f) => f.reservationId === reservationId);
    if (!folio) return null;

    const newPayment: FolioPayment = {
      ...payment,
      id: `fp-${Date.now()}`,
    };

    folio.payments.push(newPayment);
    folio.totalPaid += payment.amount;
    folio.balanceDue = folio.totalCharges - folio.totalPaid;

    return folio;
  },

  /**
   * Create a new Walk-in or Online reservation
   */
  async createReservation(params: {
    roomTypeId: string;
    roomId?: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    guest: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      identityNumber?: string;
    };
    source: Reservation['source'];
    depositPaid?: number;
    specialRequests?: string;
  }): Promise<Reservation> {
    const roomTypes = await this.getRoomTypes();
    const selectedType = roomTypes.find((rt) => rt.id === params.roomTypeId) || roomTypes[0];

    // Find available room of this type
    let assignedRoom = activeRooms.find((r) => {
      if (params.roomId) return r.id === params.roomId;
      return r.roomTypeId === params.roomTypeId && r.status === 'available';
    });

    if (!assignedRoom) {
      assignedRoom = activeRooms.find((r) => r.status === 'available') || activeRooms[0];
    }

    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = nights * selectedType.basePrice;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      bookingCode: params.source === 'walk_in' ? `WI-${Date.now().toString().slice(-5)}` : `TH-${Date.now().toString().slice(-6)}`,
      source: params.source,
      guest: {
        id: `g-${Date.now()}`,
        firstName: params.guest.firstName,
        lastName: params.guest.lastName,
        email: params.guest.email,
        phone: params.guest.phone,
        identityNumber: params.guest.identityNumber,
        vip: false,
      },
      roomId: assignedRoom.id,
      roomNumber: assignedRoom.number,
      roomTypeId: selectedType.id,
      roomTypeName: selectedType.name,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      nights,
      adults: params.adults,
      children: params.children,
      status: 'confirmed',
      totalAmount,
      depositPaid: params.depositPaid || 0,
      specialRequests: params.specialRequests,
      createdAt: new Date().toISOString().split('T')[0],
    };

    activeReservations.unshift(newRes);

    // Update room status
    assignedRoom.status = 'reserved';
    assignedRoom.currentReservationId = newRes.id;
    assignedRoom.currentGuestName = `${params.guest.firstName} ${params.guest.lastName}`;

    // Initialize Folio
    const newFolio: HotelFolio = {
      id: `fol-${Date.now()}`,
      reservationId: newRes.id,
      folioNumber: `FOL-${Date.now().toString().slice(-6)}`,
      guestName: `${params.guest.firstName} ${params.guest.lastName}`,
      roomNumber: assignedRoom.number,
      items: [
        {
          id: `fi-${Date.now()}-room`,
          date: params.checkInDate,
          description: `${selectedType.name} (${nights} night${nights > 1 ? 's' : ''})`,
          category: 'room',
          quantity: nights,
          unitPrice: selectedType.basePrice,
          total: totalAmount,
        },
      ],
      payments: params.depositPaid ? [
        {
          id: `fp-${Date.now()}-dep`,
          date: new Date().toISOString().split('T')[0],
          amount: params.depositPaid,
          method: 'credit_card',
          reference: 'INITIAL-DEPOSIT',
        }
      ] : [],
      totalCharges: totalAmount,
      totalPaid: params.depositPaid || 0,
      balanceDue: totalAmount - (params.depositPaid || 0),
      isClosed: false,
    };
    activeFolios.unshift(newFolio);

    return newRes;
  },

  /**
   * Get calculated dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const rooms = await this.getRooms();
    const reservations = await this.getReservations();
    const folios = await this.getAllFolios();

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
    const availableRooms = rooms.filter((r) => r.status === 'available').length;
    const cleaningRooms = rooms.filter((r) => r.status === 'cleaning').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const todayStr = '2026-09-12';
    const todayCheckIns = reservations.filter((r) => r.checkInDate === todayStr && r.status === 'confirmed').length;
    const todayCheckOuts = reservations.filter((r) => r.checkOutDate === todayStr && r.status === 'checked_in').length;
    const pendingOTABookings = reservations.filter((r) => (r.source === 'booking_com' || r.source === 'makemytrip') && r.status === 'confirmed').length;

    const todayRevenue = folios.reduce((sum, f) => sum + f.totalPaid, 0);

    return {
      occupancyRate,
      totalRooms,
      occupiedRooms,
      availableRooms,
      cleaningRooms,
      maintenanceRooms,
      todayCheckIns,
      todayCheckOuts,
      todayRevenue,
      pendingOTABookings,
    };
  }
};
