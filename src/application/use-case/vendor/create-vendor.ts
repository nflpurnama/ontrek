import { Vendor } from "@/src/domain/entities/vendor";
import { VendorRepository } from "@/src/domain/repository/vendor-repository";

export class CreateVendorUseCase {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async execute({name, categoryId}: {name: string, categoryId: string | null}) {
    const vendorToCreate = Vendor.create({
        name,
        defaultCategoryId: categoryId
    })
    await this.vendorRepository.saveVendor(vendorToCreate);
  }
}
