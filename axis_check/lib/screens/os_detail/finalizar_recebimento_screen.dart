import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../models/checklist_recebimento_model.dart';
import '../../models/os_operacao_model.dart';
import '../../services/recebimento_service.dart';
import '../../widgets/app_header.dart';
import '../../widgets/recebimento_resumo_card.dart';
import '../../widgets/summary_metric_card.dart';

class FinalizarRecebimentoScreen extends StatelessWidget {
  final OsOperacao os;
  final Map<String, ChecklistRecebimento> checklistsPorEquipamento;

  FinalizarRecebimentoScreen({
    super.key,
    required this.os,
    required this.checklistsPorEquipamento,
  });

  final RecebimentoService recebimentoService = RecebimentoService();

  List<ChecklistRecebimento> get equipamentos {
    return checklistsPorEquipamento.values.toList();
  }

  int get totalFotos {
    return equipamentos.fold(
      0,
      (total, checklist) => total + checklist.fotos.length,
    );
  }

  int get totalComAvaria {
    return equipamentos.where((checklist) => checklist.possuiAvaria).length;
  }

  Future<void> confirmarEnvio(BuildContext context) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) {
        return const Center(
          child: CircularProgressIndicator(),
        );
      },
    );

    final jaRecebida = await recebimentoService.osJaFoiRecebida(
      numeroOs: os.numeroOs,
      usarMock: false,
    );

    if (!context.mounted) return;

    if (jaRecebida) {
      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('A OS ${os.numeroOs} já possui recebimento registrado.'),
        ),
      );

      return;
    }

    final sucesso = await recebimentoService.enviarRecebimento(
      os: os,
      checklistsPorEquipamento: checklistsPorEquipamento,
      usarMock: false,
    );

    if (!context.mounted) return;

    Navigator.pop(context);

    if (sucesso) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Recebimento enviado para o Axis com sucesso.'),
        ),
      );

      Navigator.popUntil(context, (route) => route.isFirst);
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Erro ao enviar recebimento. Tente novamente.'),
      ),
    );
  }

  void abrirConfirmacao(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(26),
        ),
      ),
      builder: (_) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 42,
                  height: 5,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.cloud_upload_outlined,
                    color: AppColors.black,
                    size: 30,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Confirmar envio?',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'O recebimento da ${os.numeroOs} será enviado para o Axis e as manutenções serão criadas.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.mutedText,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 22),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      confirmarEnvio(context);
                    },
                    icon: const Icon(Icons.check_circle_outline),
                    label: const Text('Sim, confirmar envio'),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Revisar novamente'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final totalEquipamentos = equipamentos.length;

    return Scaffold(
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: SizedBox(
          height: 54,
          child: ElevatedButton.icon(
            onPressed: () => abrirConfirmacao(context),
            icon: const Icon(Icons.send_outlined),
            label: const Text('Confirmar envio para o Axis'),
          ),
        ),
      ),
      body: Column(
        children: [
          AppHeader(
            title: 'Finalizar',
            subtitle: 'Revise o recebimento antes de enviar',
            icon: Icons.task_alt_rounded,
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          os.numeroOs,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: AppColors.black,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _InfoLinha(
                          label: 'Cliente',
                          valor: os.cliente.isEmpty
                              ? 'Não informado'
                              : os.cliente,
                        ),
                        _InfoLinha(
                          label: 'Operação',
                          valor: os.descricaoOperacao.isEmpty
                              ? 'Não informada'
                              : os.descricaoOperacao,
                        ),
                        _InfoLinha(
                          label: 'Status',
                          valor: os.status,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                Row(
                  children: [
                    Expanded(
                      child: SummaryMetricCard(
                        title: 'Equipamentos',
                        value: '$totalEquipamentos',
                        icon: Icons.precision_manufacturing_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: SummaryMetricCard(
                        title: 'Fotos',
                        value: '$totalFotos',
                        icon: Icons.photo_camera_outlined,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: SummaryMetricCard(
                        title: 'Com avaria',
                        value: '$totalComAvaria',
                        icon: Icons.warning_amber_rounded,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: SummaryMetricCard(
                        title: 'Conferidos',
                        value: '$totalEquipamentos/${os.equipamentos.length}',
                        icon: Icons.check_circle_outline,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                const Text(
                  'Equipamentos conferidos',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),

                const SizedBox(height: 12),

                ...equipamentos.map(
                  (checklist) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: RecebimentoResumoCard(
                      checklist: checklist,
                    ),
                  ),
                ),

                const SizedBox(height: 80),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoLinha extends StatelessWidget {
  final String label;
  final String valor;

  const _InfoLinha({
    required this.label,
    required this.valor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 92,
            child: Text(
              '$label:',
              style: const TextStyle(
                color: AppColors.mutedText,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Expanded(
            child: Text(
              valor,
              style: const TextStyle(
                color: AppColors.black,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
