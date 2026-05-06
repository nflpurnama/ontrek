import { Category } from "@/src/domain/entities/category";
import { CategoryRepository } from "@/src/domain/repository/category-repository";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(category: Category) {
    await this.categoryRepository.updateCategory(category);
  }
}
