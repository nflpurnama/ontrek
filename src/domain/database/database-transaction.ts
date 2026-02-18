export interface DatabaseTransaction{
    runInTransaction(callback: () => Promise<void>): Promise<void>
}