import { Category } from "@/src/domain/entities/category";
import { CategoryRepository } from "@/src/domain/repository/category-repository";
import { DEFAULT_CATEGORY_NAMES } from "@/src/config/default-categories"

export class EnsureDefaultCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute() {
    const categories = await this.repository.getAllCategories();

    if (categories.length < 1){
        DEFAULT_CATEGORY_NAMES.map(name => this.repository.saveCategory(Category.create({name})))
    }
  }
}
