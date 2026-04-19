import type { Showroom } from '../../types/showroom';

export const MONKA_HONDA: Showroom = {
    showroomId: "SH002",
    name: "Monka Honda",
    brand: "Honda",
    tagline: "Your Trusted Partner in Jamshedpur",
    state: "Jharkhand",
    gstNumber: "20AAAAA0000A1Z1",
    contact: {
        phone: "+91 91234 56789",
        email: "contact@monkahonda.com",
        whatsapp: "+91 91234 56789"
    },
    address: {
        street: "Main Road, Bistupur",
        city: "Jamshedpur",
        state: "Jharkhand",
        pincode: "831001",
        mapLink: "https://maps.google.com/...",
        coordinates: {
            lat: 22.8046,
            lng: 86.2029
        }
    },
    branding: {
        primaryColor: "#E31837", // Honda Red
        secondaryColor: "#2D2E2E",
        logoUrl: "/logos/honda-logo.png"
    },
    workingHours: {
        weekdays: "09:30 AM - 07:30 PM",
        sunday: "10:00 AM - 02:00 PM"
    }
};
