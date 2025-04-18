// src/types/organization.ts

export interface Member {
    id: string;
    name: string;
    role?: string;
  }
  
  export interface Organization {
    id: string;
    name: string;
    members?: Member[];
  }