import { Category } from "../entities/category";
import { Id } from "../value-objects/id";

export interface CategoryRepository {
  getCategory(ids: Id[]): Promise<Category[]>;
  getAllCategories(): Promise<Category[]>;
  saveCategory(category: Category): Promise<Id>;
  updateCategory(category: Category): Promise<Id>;
  deleteCategory(id: Id): Promise<void>;
}
