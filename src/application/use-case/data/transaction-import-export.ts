import * as FileSystem from "expo-file-system";
import { TransactionRepository } from "@/src/domain/repository/transaction-repository";
import { AccountRepository } from "@/src/domain/repository/account-repository";
import { Transaction } from "@/src/domain/entities/transaction";
import { Id } from "@/src/domain/value-objects/id";

export interface ExportedTransaction {
  id: string;
  transactionDate: string;
  type: string;
  spendingType: string;
  amount: number;
  description: string | null;
  categoryId: string | null;
  vendorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export class TransactionExportUseCase {
  constructor(
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(): Promise<FileSystem.File> {
    const transactions = await this.transactionRepo.findTransactions({});

    const data: ExportedTransaction[] = transactions.map((t) => ({
      id: t.id.getValue(),
      transactionDate: t.transactionDate.toISOString(),
      type: t.type,
      spendingType: t.spendingType,
      amount: t.amount,
      description: t.description,
      categoryId: t.categoryId,
      vendorId: t.vendorId,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions: data,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const fileName = `ontrek-transactions-${Date.now()}.json`;
    const file = new FileSystem.File(FileSystem.Paths.document, fileName);
    await file.write(jsonString);

    return file;
  }
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  skipped: number;
  errors: { id: string | null; message: string }[];
}

export class TransactionImportUseCase {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository,
  ) {}

  async execute(file: FileSystem.File): Promise<ImportResult> {
    try {
      const jsonString = await file.text();

      if (!jsonString) {
        return { success: false, message: "File is empty", imported: 0, skipped: 0, errors: [] };
      }

      const data = JSON.parse(jsonString);

      if (data.version !== 1 || !Array.isArray(data.transactions)) {
        return { success: false, message: "Invalid file format", imported: 0, skipped: 0, errors: [] };
      }

      let imported = 0;
      let skipped = 0;
      const errors: { id: string | null; message: string }[] = [];

      for (const raw of data.transactions) {
        if (!raw.id) {
          errors.push({ id: null, message: "Missing id" });
          continue;
        }

        try {
          const existing = await this.transactionRepo.getTransaction([Id.rehydrate(raw.id)]);
          if (existing.length > 0) {
            skipped++;
            continue;
          }

          const transaction = Transaction.rehydrate({
            id: raw.id,
            transactionDate: new Date(raw.transactionDate),
            type: raw.type ?? "EXPENSE",
            spendingType: "ESSENTIAL",
            amount: raw.amount ?? 0,
            description: raw.description ?? null,
            categoryId: null,
            vendorId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          await this.transactionRepo.saveTransaction(transaction);
          imported++;
        } catch (error) {
          errors.push({
            id: raw.id,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const accounts = await this.accountRepo.getAllAccounts();
      for (const account of accounts) {
        const allTransactions = await this.transactionRepo.findTransactions({});
        let balance = 0;
        for (const t of allTransactions) {
          if (t.type === "INCOME" || t.type === "ADJ") {
            balance += t.amount;
          } else {
            balance -= t.amount;
          }
        }
        const diff = balance - account.balance;
        if (diff > 0) {
          account.credit(diff);
        } else if (diff < 0) {
          account.debit(Math.abs(diff));
        }
        if (diff !== 0) {
          await this.accountRepo.updateAccount(account);
        }
      }

      let message = `Imported ${imported}, skipped ${skipped}`;
      if (errors.length > 0) {
        message += `, ${errors.length} errors`;
        message += `\n\n${errors.map((e) => `${e.id ?? "unknown"}: ${e.message}`).join("\n")}`;
      }

      return {
        success: errors.length === 0,
        message,
        imported,
        skipped,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to import",
        imported: 0,
        skipped: 0,
        errors: [],
      };
    }
  }
}
