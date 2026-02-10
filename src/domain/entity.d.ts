import { Category } from "./category";

export interface Entity{
    id: string;
    name: string;
    lastModified: Date;
    defaultCategory?: Category;
}