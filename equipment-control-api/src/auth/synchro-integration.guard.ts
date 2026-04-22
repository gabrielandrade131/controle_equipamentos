import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class SynchroIntegrationGuard implements CanActivate {
    private normalizeKey(value: unknown): string {
        return String(value ?? '').trim().replace(/^-+/, '');
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        const integrationKey = request.headers['x-integration-key'];
        const expectedKey = process.env.SYNCHRO_INTEGRATION_KEY;

        if (!expectedKey) {
            throw new UnauthorizedException(
                'Chave de integração não configurada no servidor.',
            );
        }

        if (
            !integrationKey ||
            this.normalizeKey(integrationKey) !== this.normalizeKey(expectedKey)
        ) {
            throw new UnauthorizedException('Chave de integração inválida.');
        }

        return true;

    }
}
