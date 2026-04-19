import type { Showroom } from '../../types/showroom';

export const SANDHYA_HONDA: Showroom = {
    showroomId: "SH001",
    name: "Sandhya Honda",
    brand: "Honda",
    tagline: "Your Trusted Honda Partner",
    state: "Bihar",
    gstNumber: "10XXXXX1234X1XX",
    contact: {
        phone: "+91-XXXXXXXXXX",
        email: "info@sandhyahonda.com",
        whatsapp: "+91-XXXXXXXXXX"
    },
    address: {
        street: "Exhibition Road",
        city: "Patna",
        state: "Bihar",
        pincode: "800001",
        mapLink: "https://maps.google.com/...",
        coordinates: {
            lat: 25.5941,
            lng: 85.1376
        }
    },
    branding: {
        primaryColor: "#CC0000",
        secondaryColor: "#000000",
        logoUrl: "/assets/sandhya-honda-logo.png"
    },
    workingHours: {
        weekdays: "9:00 AM - 7:00 PM",
        sunday: "9:00 AM - 6:00 PM"
    }
};
