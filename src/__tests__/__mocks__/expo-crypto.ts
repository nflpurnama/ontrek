import { randomUUID as nodeRandomUUID } from 'crypto';

export const randomUUID = (): string => nodeRandomUUID();