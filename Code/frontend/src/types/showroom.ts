export interface Showroom {
    showroomId: string;
    name: string;
    brand: string;
    tagline: string;
    state: string;
    gstNumber: string;
    contact: {
        phone: string;
        email: string;
        whatsapp: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        mapLink: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    branding: {
        primaryColor: string;
        secondaryColor: string;
        logoUrl: string;
    };
    workingHours: {
        weekdays: string;
        sunday: string;
    };
    pricingConfig?: {
        margins: number;
        documentationCharges: number;
        rtoCharges: Record<string, number>;
    };
}
