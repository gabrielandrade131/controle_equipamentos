import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { readFile } from 'fs/promises';
import { join } from 'path';

@ApiTags('Mobile App')
@Controller('mobile-app')
export class MobileAppController {
  @Get('axis-check/version')
  @ApiOperation({ summary: 'Retorna a versao publicada do Axis Check' })
  async getAxisCheckVersion() {
    const versionFile = join(
      process.cwd(),
      '..',
      'uploads',
      'axis-check',
      'version.json',
    );

    try {
      const raw = await readFile(versionFile, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      throw new NotFoundException(
        'Versao publicada do Axis Check ainda nao configurada.',
      );
    }
  }
}
