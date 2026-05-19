import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../models/checklist_recebimento_model.dart';
import '../../models/equipamento_operacao_model.dart';
import '../../models/os_operacao_model.dart';
import '../../widgets/app_header.dart';
import '../../widgets/equipamento_recebimento_card.dart';
import '../../widgets/progress_summary_card.dart';
import '../checklist/equipamento_checklist_screen.dart';
import 'finalizar_recebimento_screen.dart';

class OsDetailScreen extends StatefulWidget {
  final OsOperacao os;

  const OsDetailScreen({
    super.key,
    required this.os,
  });

  @override
  State<OsDetailScreen> createState() => _OsDetailScreenState();
}

class _OsDetailScreenState extends State<OsDetailScreen> {
  final Map<String, ChecklistRecebimento> checklistsPorEquipamento = {};

  bool get todosEquipamentosConferidos {
    return checklistsPorEquipamento.length == widget.os.equipamentos.length;
  }

  int get totalConferidos => checklistsPorEquipamento.length;

  Future<void> abrirChecklist(EquipamentoOperacao equipamento) async {
    final checklist = await Navigator.push<ChecklistRecebimento>(
      context,
      MaterialPageRoute(
        builder: (_) => EquipamentoChecklistScreen(
          equipamento: equipamento,
        ),
      ),
    );

    if (checklist == null) {
      return;
    }

    setState(() {
      checklistsPorEquipamento[equipamento.id] = checklist;
    });
  }

  void finalizarRecebimento() {
    if (!todosEquipamentosConferidos) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Todos os equipamentos precisam ter checklist e fotos antes de finalizar.',
          ),
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => FinalizarRecebimentoScreen(
          os: widget.os,
          checklistsPorEquipamento: checklistsPorEquipamento,
        ),
      ),
    );
  }

  void marcarTodosRetornaram() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Agora faça o checklist e tire as fotos de cada equipamento.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final os = widget.os;

    return Scaffold(
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: SizedBox(
          height: 54,
          child: ElevatedButton.icon(
            onPressed: todosEquipamentosConferidos ? finalizarRecebimento : null,
            icon: const Icon(Icons.cloud_upload_outlined),
            label: Text(
              todosEquipamentosConferidos
                  ? 'Finalizar recebimento'
                  : 'Checklist pendente ($totalConferidos/${os.equipamentos.length})',
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          AppHeader(
            title: os.numeroOs,
            subtitle: 'Conferência dos equipamentos da operação',
            icon: Icons.inventory_2_outlined,
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
                        const Text(
                          'Dados da operação',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 14),
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
                        _InfoLinha(
                          label: 'Equipamentos',
                          valor: '${os.equipamentos.length}',
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                ProgressSummaryCard(
                  total: os.equipamentos.length,
                  concluido: totalConferidos,
                ),

                const SizedBox(height: 14),

                SizedBox(
                  height: 52,
                  child: OutlinedButton.icon(
                    onPressed: marcarTodosRetornaram,
                    icon: const Icon(Icons.done_all_rounded),
                    label: const Text('Todos os equipamentos retornaram'),
                  ),
                ),

                const SizedBox(height: 24),

                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Equipamentos',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    Text(
                      '$totalConferidos/${os.equipamentos.length}',
                      style: const TextStyle(
                        color: AppColors.techBlue,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                ...os.equipamentos.map(
                  (equipamento) {
                    final checklist =
                        checklistsPorEquipamento[equipamento.id];

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: EquipamentoRecebimentoCard(
                        equipamento: equipamento,
                        checklist: checklist,
                        onTap: () => abrirChecklist(equipamento),
                      ),
                    );
                  },
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
            width: 105,
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