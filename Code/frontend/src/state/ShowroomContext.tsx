import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Showroom } from '../types/showroom';
import { SANDHYA_HONDA } from '../constants/showrooms/sandhya-honda';
import { MONKA_HONDA } from '../constants/showrooms/monka-honda';
import { DUA_HONDA } from '../constants/showrooms/dua-honda';
import { SANDHYA_HONDA_BOKARO } from '../constants/showrooms/sandhya-honda-bokaro';

const ALL_SHOWROOMS: Showroom[] = [
    SANDHYA_HONDA,
    MONKA_HONDA,
    DUA_HONDA,
    SANDHYA_HONDA_BOKARO
];

interface ShowroomContextType {
    activeShowroom: Showroom;
    setActiveShowroom: (showroom: Showroom) => void;
    allShowrooms: Showroom[];
}

const ShowroomContext = createContext<ShowroomContextType | undefined>(undefined);

// Helper function to calculate distance using Haversine formula
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

export const ShowroomProvider = ({ children }: { children: ReactNode }) => {
    const [activeShowroom, setActiveShowroom] = useState<Showroom>(SANDHYA_HONDA);

    useEffect(() => {
        // Check if user has already manually selected a showroom
        const savedShowroomId = localStorage.getItem('selectedShowroomId');
        if (savedShowroomId) {
            const savedShowroom = ALL_SHOWROOMS.find(s => s.showroomId === savedShowroomId);
            if (savedShowroom) {
                setActiveShowroom(savedShowroom);
                return;
            }
        }

        // Attempt to get user's location for auto-selection
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    let nearestShowroom = ALL_SHOWROOMS[0];
                    let minDistance = Infinity;

                    ALL_SHOWROOMS.forEach(showroom => {
                        const distance = getDistance(
                            latitude,
                            longitude,
                            showroom.address.coordinates.lat,
                            showroom.address.coordinates.lng
                        );
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestShowroom = showroom;
                        }
                    });

                    setActiveShowroom(nearestShowroom);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    // Fallback to default (SANDHYA_HONDA Patna) already handled by initial state
                }
            );
        }
    }, []);

    const handleSetActiveShowroom = (showroom: Showroom) => {
        setActiveShowroom(showroom);
        localStorage.setItem('selectedShowroomId', showroom.showroomId);
    };

    return (
        <ShowroomContext.Provider value={{
            activeShowroom,
            setActiveShowroom: handleSetActiveShowroom,
            allShowrooms: ALL_SHOWROOMS
        }}>
            {children}
        </ShowroomContext.Provider>
    );
};

export const useShowroom = () => {
    const context = useContext(ShowroomContext);
    if (context === undefined) {
        throw new Error('useShowroom must be used within a ShowroomProvider');
    }
    return context;
};
