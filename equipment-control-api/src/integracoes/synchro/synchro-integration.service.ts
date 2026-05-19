import { Injectable, Logger } from '@nestjs/common';

type EquipamentoRetornoSynchro = {
  equipamentoId?: string | null;
  tag?: string | null;
  numeroSerie?: string | null;
};

type MarcarRetornoBasePayload = {
  osId?: string | null;
  numeroOs: string;
  dataRecebimento: string;
  equipamentos: EquipamentoRetornoSynchro[];
};

@Injectable()
export class SynchroIntegrationService {
  private readonly logger = new Logger(SynchroIntegrationService.name);

  private readonly synchroApiUrl = process.env.SYNCHRO_API_URL;
  private readonly synchroApiToken = process.env.SYNCHRO_API_TOKEN;

  async marcarEquipamentosComoRetornados(
    payload: MarcarRetornoBasePayload,
  ): Promise<boolean> {
    if (!this.synchroApiUrl) {
      this.logger.warn(
        'SYNCHRO_API_URL não configurada. Integração com Synchro ignorada.',
      );
      return false;
    }

    try {
      const response = await fetch(
        `${this.synchroApiUrl}/api/axis-check/retorno-base`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.synchroApiToken ?? ''}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const resposta = await response.text();

        this.logger.warn(
          `Synchro retornou erro ao marcar retorno da OS ${payload.numeroOs}: ${response.status} - ${resposta}`,
        );

        return false;
      }

      this.logger.log(
        `Synchro atualizado com sucesso para OS ${payload.numeroOs}.`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Erro ao comunicar com Synchro para OS ${payload.numeroOs}.`,
        error,
      );

      return false;
    }
  }
}