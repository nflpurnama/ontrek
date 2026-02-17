import { Vendor } from "../entities/vendor";
import { Id } from "../value-objects/id";

export interface VendorRepository {
  getVendor(ids: Id[]): Promise<Vendor[]>;
  getAllVendors(): Promise<Vendor[]>;
  saveVendor(vendor: Vendor): Promise<Id>;
  updateVendor(vendor: Vendor): Promise<Id>;
  deleteVendor(id: Id): Promise<void>;
}
