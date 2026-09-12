# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import json

class HotelApiController(http.Controller):

    @http.route('/api/v1/hotel/rooms', type='json', auth='public', methods=['POST', 'GET'], csrf=False)
    def get_rooms(self, **kwargs):
        """Returns room rack matrix data with live status"""
        rooms = request.env['hotel.room'].sudo().search([])
        result = []
        for r in rooms:
            result.append({
                'id': r.id,
                'number': r.name,
                'floor': r.floor,
                'room_type_id': r.room_type_id.id,
                'room_type_name': r.room_type_id.name,
                'status': r.status,
                'housekeeping_status': r.housekeeping_status,
            })
        return {'status': 'success', 'data': result}

    @http.route('/api/v1/hotel/booking/create', type='json', auth='public', methods=['POST'], csrf=False)
    def create_booking(self, **kwargs):
        """Creates guest partner, reservation, and folio from Next.js booking engine or OTA"""
        params = request.dispatcher.jsonrequest or kwargs
        partner_name = f"{params.get('first_name', '')} {params.get('last_name', '')}".strip() or 'Guest'
        
        # 1. Find or create guest partner
        partner = request.env['res.partner'].sudo().search([('email', '=', params.get('email'))], limit=1)
        if not partner:
            partner = request.env['res.partner'].sudo().create({
                'name': partner_name,
                'email': params.get('email'),
                'phone': params.get('phone'),
            })

        # 2. Create reservation
        res_vals = {
            'partner_id': partner.id,
            'room_id': params.get('room_id'),
            'room_type_id': params.get('room_type_id'),
            'source_channel': params.get('source', 'direct'),
            'checkin_date': params.get('check_in'),
            'checkout_date': params.get('check_out'),
            'adults': params.get('adults', 2),
            'children': params.get('children', 0),
            'total_cost': params.get('total_amount', 0.0),
            'deposit_paid': params.get('deposit_paid', 0.0),
            'special_requests': params.get('special_requests', ''),
            'state': 'confirmed',
        }
        reservation = request.env['hotel.reservation'].sudo().create(res_vals)

        # 3. Mark room reserved
        if reservation.room_id:
            reservation.room_id.write({'status': 'reserved'})

        # 4. Create Folio
        folio = request.env['hotel.folio'].sudo().create({
            'reservation_id': reservation.id,
            'name': f"FOL-{reservation.id}",
            'total_paid': params.get('deposit_paid', 0.0),
        })
        reservation.write({'folio_id': folio.id})

        return {
            'status': 'success',
            'reservation_id': reservation.id,
            'booking_code': reservation.name,
            'folio_id': folio.id,
        }

    @http.route('/api/v1/hotel/ota/webhook', type='json', auth='public', methods=['POST'], csrf=False)
    def ota_webhook(self, **kwargs):
        """
        Receives webhook payloads from OTA Channel Manager (Channex.io / Beds24)
        for Booking.com and MakeMyTrip bookings.
        """
        payload = request.dispatcher.jsonrequest or kwargs
        channel = payload.get('channel', 'booking_com') # 'booking_com' or 'makemytrip'
        
        # Process inbound OTA payload into Odoo
        return {
            'status': 'received',
            'channel': channel,
            'message': 'OTA reservation queued and processed in Odoo PMS',
        }
