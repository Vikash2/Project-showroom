import type { Showroom } from '../../types/showroom';

export const SANDHYA_HONDA_BOKARO: Showroom = {
    showroomId: "SH004",
    name: "Sandhya Honda (Bokaro)",
    brand: "Honda",
    tagline: "Serving Bokaro with Pride",
    state: "Jharkhand",
    gstNumber: "20CCCCC0000C1Z1",
    contact: {
        phone: "+91 99887 76655",
        email: "bokaro@sandhyahonda.com",
        whatsapp: "+91 99887 76655"
    },
    address: {
        street: "Main Road, Chas",
        city: "Bokaro",
        state: "Jharkhand",
        pincode: "827013",
        mapLink: "https://maps.google.com/...",
        coordinates: {
            lat: 23.6335,
            lng: 86.1663
        }
    },
    branding: {
        primaryColor: "#E31837", // Honda Red
        secondaryColor: "#2D2E2E",
        logoUrl: "/logos/honda-logo.png"
    },
    workingHours: {
        weekdays: "09:30 AM - 07:00 PM",
        sunday: "10:00 AM - 01:00 PM"
    }
};
