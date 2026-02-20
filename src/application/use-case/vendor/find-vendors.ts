import { VendorRepository } from "@/src/domain/repository/vendor-repository";

export class FindVendorsUseCase {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async execute({name}: {name?: string}) {
    return await this.vendorRepository.findVendors({name});
  }
}
