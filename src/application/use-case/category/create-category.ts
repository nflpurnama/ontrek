import { Category } from "@/src/domain/entities/category";
import { CategoryRepository } from "@/src/domain/repository/category-repository";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({ name }: { name: string }) {
    const categoryToCreate = Category.create({ name });
    await this.categoryRepository.saveCategory(categoryToCreate);
  }
}
