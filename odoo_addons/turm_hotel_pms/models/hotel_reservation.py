# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class HotelReservation(models.Model):
    _name = 'hotel.reservation'
    _description = 'Hotel Reservation & Channel Booking'
    _inherit = ['mail.thread', 'mail.activity.mixin'] if 'mail.thread' in models.Model._inherit_cache else []

    name = fields.Char(string='Booking Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    partner_id = fields.Many2one('res.partner', string='Guest Contact', required=True)
    guest_email = fields.Char(related='partner_id.email', readonly=False, string='Email')
    guest_phone = fields.Char(related='partner_id.phone', readonly=False, string='Phone')
    id_type = fields.Selection([
        ('passport', 'Passport'),
        ('national_id', 'National ID'),
        ('driving_license', 'Driving License')
    ], string='ID Type', default='passport')
    id_number = fields.Char(string='Passport / ID Number')
    is_vip = fields.Boolean(string='VIP Guest', default=False)

    room_id = fields.Many2one('hotel.room', string='Assigned Room', required=True)
    room_type_id = fields.Many2one('hotel.room.type', string='Room Category', required=True)

    source_channel = fields.Selection([
        ('direct', 'Direct Web Engine'),
        ('walk_in', 'Front Desk Walk-In'),
        ('booking_com', 'Booking.com'),
        ('makemytrip', 'MakeMyTrip'),
        ('agoda', 'Agoda'),
        ('corporate', 'Corporate Partner'),
    ], string='Channel Source', default='direct', required=True)

    checkin_date = fields.Date(string='Check-In Date', required=True)
    checkout_date = fields.Date(string='Check-Out Date', required=True)
    nights = fields.Integer(string='Nights', compute='_compute_nights', store=True)
    adults = fields.Integer(string='Adults', default=2)
    children = fields.Integer(string='Children', default=0)

    state = fields.Selection([
        ('draft', 'Draft Quote'),
        ('confirmed', 'Confirmed'),
        ('checked_in', 'Checked In'),
        ('checked_out', 'Checked Out'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='confirmed', tracking=True)

    total_cost = fields.Float(string='Total Cost', required=True, default=0.0)
    deposit_paid = fields.Float(string='Deposit / Advance Paid', default=0.0)
    special_requests = fields.Text(string='Special Requests / Notes')

    folio_id = fields.Many2one('hotel.folio', string='Guest Folio')

    @api.depends('checkin_date', 'checkout_date')
    def _compute_nights(self):
        for rec in self:
            if rec.checkin_date and rec.checkout_date:
                delta = (rec.checkout_date - rec.checkin_date).days
                rec.nights = max(1, delta)
            else:
                rec.nights = 1

    def action_checkin(self):
        self.ensure_one()
        self.state = 'checked_in'
        if self.room_id:
            self.room_id.status = 'occupied'

    def action_checkout(self):
        self.ensure_one()
        self.state = 'checked_out'
        if self.room_id:
            self.room_id.status = 'cleaning'
            self.room_id.housekeeping_status = 'dirty'
        if self.folio_id:
            self.folio_id.is_closed = True
