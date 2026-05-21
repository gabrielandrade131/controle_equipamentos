import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../models/checklist_recebimento_model.dart';
import '../../models/equipamento_operacao_model.dart';
import '../../models/os_operacao_model.dart';
import '../../widgets/app_header.dart';
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

  double get progresso {
    if (widget.os.equipamentos.isEmpty) return 0;
    return totalConferidos / widget.os.equipamentos.length;
  }

  Future<void> abrirChecklist(EquipamentoOperacao equipamento) async {
    final checklist = await Navigator.push<ChecklistRecebimento>(
      context,
      MaterialPageRoute(
        builder: (_) => EquipamentoChecklistScreen(
          equipamento: equipamento,
        ),
      ),
    );

    if (checklist == null) return;

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

  @override
  Widget build(BuildContext context) {
    final os = widget.os;
    final total = os.equipamentos.length;

    return Scaffold(
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: SizedBox(
          height: 54,
          child: ElevatedButton(
            onPressed: todosEquipamentosConferidos ? finalizarRecebimento : null,
            child: Text(
              todosEquipamentosConferidos
                  ? 'Finalizar recebimento'
                  : 'Checklist pendente ($totalConferidos/$total)',
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          AppHeader(
            title: 'OS ${os.numeroOs}',
            subtitle: os.cliente.isEmpty ? 'Cliente não informado' : os.cliente,
            icon: Icons.inventory_2_outlined,
            showBackButton: true,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 90),
              children: [
                const Text(
                  'Conferência',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: AppColors.black,
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '$totalConferidos de $total equipamentos conferidos',
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.mutedText,
                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(height: 18),

                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    value: progresso,
                    minHeight: 10,
                    backgroundColor: AppColors.border,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primaryGreen,
                    ),
                  ),
                ),

                const SizedBox(height: 26),

                _OperationSummary(
                  numeroOs: os.numeroOs,
                  cliente: os.cliente,
                  unidade: os.unidade,
                  totalEquipamentos: total,
                ),

                const SizedBox(height: 26),

                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Equipamentos',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: AppColors.black,
                        ),
                      ),
                    ),
                    Text(
                      '$totalConferidos/$total',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.techBlue,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                ...os.equipamentos.map((equipamento) {
                  final checklist = checklistsPorEquipamento[equipamento.id];
                  final conferido = checklist != null;
                  final possuiAvaria = checklist?.possuiAvaria == true;

                  return _EquipamentoListItem(
                    equipamento: equipamento,
                    conferido: conferido,
                    possuiAvaria: possuiAvaria,
                    totalFotos: checklist?.fotos.length ?? 0,
                    onTap: () => abrirChecklist(equipamento),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _InfoSection({
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 6),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: AppColors.black,
            ),
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool showDivider;

  const _InfoRow({
    required this.label,
    required this.value,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  color: AppColors.mutedText,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(width: 14),
            Flexible(
              child: Text(
                value.isEmpty ? '-' : value,
                textAlign: TextAlign.end,
                style: const TextStyle(
                  color: AppColors.black,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
        if (showDivider)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Divider(
              height: 1,
              color: AppColors.border,
            ),
          )
        else
          const SizedBox(height: 10),
      ],
    );
  }
}

class _EquipamentoListItem extends StatelessWidget {
  final EquipamentoOperacao equipamento;
  final bool conferido;
  final bool possuiAvaria;
  final int totalFotos;
  final VoidCallback onTap;

  const _EquipamentoListItem({
    required this.equipamento,
    required this.conferido,
    required this.possuiAvaria,
    required this.totalFotos,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final statusTexto = conferido
        ? possuiAvaria
            ? 'Conferido com avaria'
            : 'Conferido'
        : 'Pendente';

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: conferido
                        ? AppColors.primaryGreen.withValues(alpha: 0.28)
                        : AppColors.techBlue.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    conferido
                        ? Icons.check_rounded
                        : Icons.precision_manufacturing_outlined,
                    color: conferido ? AppColors.black : AppColors.techBlue,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        equipamento.tipoEquipamento,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.black,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'TAG ${equipamento.tag} • Série ${equipamento.numeroSerie}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.mutedText,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        totalFotos > 0
                            ? '$statusTexto • $totalFotos foto(s)'
                            : statusTexto,
                        style: TextStyle(
                          fontSize: 12,
                          color: possuiAvaria
                              ? const Color(0xFFB42318)
                              : AppColors.techBlue,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.mutedText,
                  size: 25,
                ),
              ],
            ),
          ),
          const Divider(
            height: 1,
            color: AppColors.border,
          ),
        ],
      ),
    );
  }
}

// Helper widget classes

class _OperationSummary extends StatelessWidget {
  final String numeroOs;
  final String cliente;
  final String unidade;
  final int totalEquipamentos;

  const _OperationSummary({
    required this.numeroOs,
    required this.cliente,
    required this.unidade,
    required this.totalEquipamentos,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F8FB),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Operação',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: AppColors.black,
            ),
          ),
          const SizedBox(height: 14),
          _SummaryLine(label: 'OS', value: numeroOs),
          _SummaryLine(label: 'Cliente', value: cliente.isEmpty ? 'Não informado' : cliente),
          _SummaryLine(label: 'Unidade', value: unidade.isEmpty ? 'Não informada' : unidade),
          _SummaryLine(label: 'Equipamentos', value: '$totalEquipamentos', showDivider: false),
        ],
      ),
    );
  }
}

class _SummaryLine extends StatelessWidget {
  final String label;
  final String value;
  final bool showDivider;

  const _SummaryLine({
    required this.label,
    required this.value,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 105,
              child: Text(
                label,
                style: const TextStyle(
                  color: AppColors.mutedText,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Expanded(
              child: Text(
                value.isEmpty ? '-' : value,
                textAlign: TextAlign.end,
                style: const TextStyle(
                  color: AppColors.black,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
        if (showDivider)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 10),
            child: Divider(
              height: 1,
              color: AppColors.border,
            ),
          )
        else
          const SizedBox(height: 10),
      ],
    );
  }
}