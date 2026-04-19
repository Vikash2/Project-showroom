import type { Showroom } from '../../types/showroom';

export const DUA_HONDA: Showroom = {
    showroomId: "SH003",
    name: "Dua Honda",
    brand: "Honda",
    tagline: "Experience Excellence in Ranchi",
    state: "Jharkhand",
    gstNumber: "20BBBBB0000B1Z1",
    contact: {
        phone: "+91 98765 43210",
        email: "sales@duahonda.com",
        whatsapp: "+91 98765 43210"
    },
    address: {
        street: "Kanke Road",
        city: "Ranchi",
        state: "Jharkhand",
        pincode: "834008",
        mapLink: "https://maps.google.com/...",
        coordinates: {
            lat: 23.4150,
            lng: 85.3168
        }
    },
    branding: {
        primaryColor: "#E31837", // Honda Red
        secondaryColor: "#2D2E2E",
        logoUrl: "/logos/honda-logo.png"
    },
    workingHours: {
        weekdays: "09:00 AM - 08:00 PM",
        sunday: "Closed"
    }
};
