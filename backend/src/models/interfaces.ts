
export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumbers: string[];
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Car {
    id: string;
    clientId: string;
    licensePlate: string;
    vin: string;  //sasiu
    make: string; //brand
    model: string;
    year: number;
    engineType: 'diesel' | 'gasoline' | 'hybrid' | 'electric';
    engineCapacity: number; //cc
    horsePower: number; //CP
    kilowatts: number; //kW
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Appointment {
    id: string;
    clientId: string;
    carId: string;
    date: Date;
    duration: number;
    serviceType: string;
    contactMethod: 'email' | 'phone' | 'in-person';
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Service {
    id: string;
    appointmentId: string;
    initialState: {
        visualIssues: string[];
        clientReportedIssues: string[];
        purpose: string; //verificare, revizie etc
    };
    operations: {
        description: string;
        replacedParts: string[];
        detectedIssues: string[];
        resolvedIssues: boolean;
    };
    actualDuration: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoyaltyProgram {
    id: string;
    clientId: string;
    loyaltyClass: 'A1' | 'A2' | 'A3' | 'A4' | 'A5';
    discountPercentage: number;
    totalServiceCount: number;
    totalSpent: number;
    lastVisitDate: Date;
    nextEvaluationDate: Date;
    createdAt: Date;
    updatedAt: Date;
}