# -*- coding: utf-8 -*-
{
    'name': 'Turm Hotel Property Management System (PMS) & API',
    'version': '19.0.1.0.0',
    'category': 'Hospitality',
    'summary': 'Hotel PMS with Front-Desk, Room Rack, Folios, Invoicing, and Next.js / OTA Integration',
    'description': """
        Turm Hotel PMS & Booking API
        ============================
        - Hotel Room and Category Management
        - Folio & Incidental Billing (Mini-bar, Restaurant, Spa, Laundry)
        - Invoicing linked directly to Odoo 19 Account Move
        - Two-way OTA Channel Management (Booking.com & MakeMyTrip)
        - REST & JSON-RPC Controllers for Headless Next.js Frontend
    """,
    'author': 'Turm Hotel Development Team',
    'depends': ['base', 'sale_management', 'account'],
    'data': [
        'security/ir.model.access.csv',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
