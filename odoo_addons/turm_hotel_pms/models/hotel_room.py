# -*- coding: utf-8 -*-
from odoo import models, fields, api

class HotelRoomType(models.Model):
    _name = 'hotel.room.type'
    _description = 'Hotel Room Category'

    name = fields.Char(string='Category Name', required=True)
    code = fields.Char(string='Code', size=10, required=True)
    list_price = fields.Float(string='Base Nightly Rate', required=True, default=100.0)
    capacity_adults = fields.Integer(string='Adults Capacity', default=2)
    capacity_children = fields.Integer(string='Children Capacity', default=1)
    bed_type = fields.Char(string='Bed Type', default='1 King Bed')
    size_sqm = fields.Float(string='Room Size (sqm)', default=30.0)
    description = fields.Text(string='Description')
    image_url = fields.Char(string='Primary Photo URL')
    room_ids = fields.One2many('hotel.room', 'room_type_id', string='Rooms')


class HotelRoom(models.Model):
    _name = 'hotel.room'
    _description = 'Physical Hotel Room Unit'

    name = fields.Char(string='Room Number', required=True, index=True)
    floor = fields.Integer(string='Floor', default=1, required=True)
    room_type_id = fields.Many2one('hotel.room.type', string='Room Type', required=True)
    status = fields.Selection([
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('cleaning', 'Cleaning'),
        ('maintenance', 'Maintenance'),
    ], string='Occupancy Status', default='available', required=True)
    housekeeping_status = fields.Selection([
        ('clean', 'Clean & Inspected'),
        ('dirty', 'Dirty (Needs Cleaning)'),
        ('inspecting', 'Inspecting / In Progress'),
        ('out_of_order', 'Out of Order'),
    ], string='Housekeeping', default='clean', required=True)
    notes = fields.Text(string='Room Maintenance Notes')
