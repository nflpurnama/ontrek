import { CategoryRepository } from "@/src/domain/repository/category-repository";

export class GetAllCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute() {
    return await this.repository.getAllCategories();
  }
}
