import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import '../models/checklist_recebimento_model.dart';
import '../models/equipamento_operacao_model.dart';
import 'status_badge.dart';

class EquipamentoRecebimentoCard extends StatelessWidget {
  final EquipamentoOperacao equipamento;
  final ChecklistRecebimento? checklist;
  final VoidCallback onTap;

  const EquipamentoRecebimentoCard({
    super.key,
    required this.equipamento,
    required this.checklist,
    required this.onTap,
  });

  bool get conferido => checklist != null;

  @override
  Widget build(BuildContext context) {
    final possuiAvaria = checklist?.possuiAvaria == true;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: conferido
                      ? AppColors.primaryGreen
                      : AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: conferido
                        ? AppColors.primaryGreen
                        : AppColors.border,
                  ),
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
                        fontWeight: FontWeight.w900,
                        color: AppColors.black,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Modelo: ${equipamento.modelo}',
                      style: const TextStyle(
                        color: AppColors.mutedText,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      'Série: ${equipamento.numeroSerie}',
                      style: const TextStyle(
                        color: AppColors.mutedText,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      'TAG: ${equipamento.tag}',
                      style: const TextStyle(
                        color: AppColors.mutedText,
                        fontSize: 13,
                      ),
                    ),

                    const SizedBox(height: 12),

                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        StatusBadge(
                          label: conferido ? 'CONFERIDO' : 'PENDENTE',
                          backgroundColor: conferido
                              ? AppColors.primaryGreen.withValues(alpha: 0.35)
                              : AppColors.border,
                          textColor: AppColors.black,
                        ),
                        if (possuiAvaria)
                          const StatusBadge(
                            label: 'COM AVARIA',
                            backgroundColor: Color(0xFFFFE4E4),
                            textColor: Color(0xFFB42318),
                          ),
                        if (checklist != null)
                          StatusBadge(
                            label: '${checklist!.fotos.length} FOTO(S)',
                            backgroundColor:
                                AppColors.techBlue.withValues(alpha: 0.12),
                            textColor: AppColors.techBlue,
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              const Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: AppColors.techBlue,
              ),
            ],
          ),
        ),
      ),
    );
  }
}