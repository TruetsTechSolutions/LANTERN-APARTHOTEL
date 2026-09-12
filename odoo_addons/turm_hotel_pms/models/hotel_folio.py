# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class HotelFolio(models.Model):
    _name = 'hotel.folio'
    _description = 'Guest Hotel Folio & Billing'

    name = fields.Char(string='Folio Reference', required=True, copy=False, readonly=True, default=lambda self: _('New'))
    reservation_id = fields.Many2one('hotel.reservation', string='Reservation', required=True, ondelete='cascade')
    partner_id = fields.Many2one(related='reservation_id.partner_id', string='Customer', store=True)
    room_id = fields.Many2one(related='reservation_id.room_id', string='Room', store=True)

    line_ids = fields.One2many('hotel.folio.line', 'folio_id', string='Charges & Incidentals')
    total_charges = fields.Float(string='Total Charges', compute='_compute_totals', store=True)
    total_paid = fields.Float(string='Total Paid', default=0.0)
    balance_due = fields.Float(string='Balance Due', compute='_compute_totals', store=True)
    is_closed = fields.Boolean(string='Folio Closed', default=False)

    invoice_id = fields.Many2one('account.move', string='Odoo 19 Customer Invoice', readonly=True)

    @api.depends('line_ids.price_total', 'total_paid')
    def _compute_totals(self):
        for folio in self:
            charges = sum(line.price_total for line in folio.line_ids)
            folio.total_charges = charges
            folio.balance_due = charges - folio.total_paid

    def action_generate_invoice(self):
        """Create Odoo customer invoice (account.move) from folio lines"""
        self.ensure_one()
        if self.invoice_id:
            return self.invoice_id

        invoice_lines = []
        for line in self.line_ids:
            invoice_lines.append((0, 0, {
                'name': line.description,
                'quantity': line.quantity,
                'price_unit': line.price_unit,
            }))

        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'partner_id': self.partner_id.id,
            'invoice_date': fields.Date.context_today(self),
            'invoice_line_ids': invoice_lines,
        })
        self.invoice_id = move.id
        return move


class HotelFolioLine(models.Model):
    _name = 'hotel.folio.line'
    _description = 'Folio Incidental Line Item'

    folio_id = fields.Many2one('hotel.folio', string='Folio', required=True, ondelete='cascade')
    date = fields.Date(string='Date', default=fields.Date.context_today)
    category = fields.Selection([
        ('room', 'Room Tariff'),
        ('restaurant', 'Restaurant / Room Service'),
        ('minibar', 'Mini Bar'),
        ('laundry', 'Laundry'),
        ('spa', 'Spa & Wellness'),
        ('tax', 'City / Tourism Tax'),
        ('other', 'Other Incidental'),
    ], string='Category', default='room', required=True)
    description = fields.Char(string='Description', required=True)
    quantity = fields.Float(string='Quantity', default=1.0)
    price_unit = fields.Float(string='Unit Price', required=True, default=0.0)
    price_total = fields.Float(string='Total', compute='_compute_total', store=True)

    @api.depends('quantity', 'price_unit')
    def _compute_total(self):
        for line in self:
            line.price_total = line.quantity * line.price_unit
