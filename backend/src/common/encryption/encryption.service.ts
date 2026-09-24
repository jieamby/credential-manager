import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export interface EncryptedData {
  encryptedPassword: string;
  encryptionIv: string;
  encryptionTag: string;
}

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const keyString = this.configService.get<string>(
      'CREDENTIAL_ENCRYPTION_KEY',
    );

    if (!keyString) {
      throw new Error('CREDENTIAL_ENCRYPTION_KEY is not configured');
    }

    const key = Buffer.from(keyString, 'base64');

    if (key.length !== 32) {
      throw new Error(
        'CREDENTIAL_ENCRYPTION_KEY must be a valid 32-byte base64 key',
      );
    }

    this.key = key;
  }

  encrypt(value: string): EncryptedData {
    try {
      const iv = randomBytes(12);

      const cipher = createCipheriv(this.algorithm, this.key, iv);

      const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
      ]);

      const authTag = cipher.getAuthTag();

      return {
        encryptedPassword: encrypted.toString('base64'),
        encryptionIv: iv.toString('base64'),
        encryptionTag: authTag.toString('base64'),
      };
    } catch {
      throw new InternalServerErrorException('Failed to encrypt credential');
    }
  }
  decrypt(
    encryptedPassword: string,
    encryptionIv: string,
    encryptionTag: string,
  ): string {
    try {
      const encrypted = Buffer.from(encryptedPassword, 'base64');

      const iv = Buffer.from(encryptionIv, 'base64');

      const authTag = Buffer.from(encryptionTag, 'base64');

      const decipher = createDecipheriv(this.algorithm, this.key, iv);

      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      throw new InternalServerErrorException('Failed to decrypt credential');
    }
  }
}
