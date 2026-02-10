import { Entity } from "./entity";

export interface Transaction{
    id: string;
    name: string;
    lastModified: Date;
    entity: Entity;
    transactionDate: Date;
    type: 
    amount: number
}