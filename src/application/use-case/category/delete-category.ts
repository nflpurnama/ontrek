import { CategoryRepository } from "@/src/domain/repository/category-repository";
import { Id } from "@/src/domain/value-objects/id";

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: Id) {
    await this.categoryRepository.deleteCategory(id);
  }
}
