import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import '../models/checklist_recebimento_model.dart';
import 'status_badge.dart';

class RecebimentoResumoCard extends StatelessWidget {
  final ChecklistRecebimento checklist;

  const RecebimentoResumoCard({
    super.key,
    required this.checklist,
  });

  @override
  Widget build(BuildContext context) {
    final possuiAvaria = checklist.possuiAvaria;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: possuiAvaria
                    ? const Color(0xFFFFE4E4)
                    : AppColors.primaryGreen,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                possuiAvaria
                    ? Icons.warning_amber_rounded
                    : Icons.check_rounded,
                color: possuiAvaria
                    ? const Color(0xFFB42318)
                    : AppColors.black,
              ),
            ),

            const SizedBox(width: 14),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    checklist.tag,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: AppColors.black,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Série: ${checklist.numeroSerie}',
                    style: const TextStyle(
                      color: AppColors.mutedText,
                      fontSize: 13,
                    ),
                  ),
                  Text(
                    'Fotos: ${checklist.fotos.length}',
                    style: const TextStyle(
                      color: AppColors.mutedText,
                      fontSize: 13,
                    ),
                  ),

                  if (checklist.observacao.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      checklist.observacao,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.black,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],

                  const SizedBox(height: 12),

                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      const StatusBadge(
                        label: 'CONFERIDO',
                        backgroundColor: Color(0xFFE8FFD2),
                        textColor: AppColors.black,
                      ),
                      StatusBadge(
                        label: possuiAvaria ? 'COM AVARIA' : 'SEM AVARIA',
                        backgroundColor: possuiAvaria
                            ? const Color(0xFFFFE4E4)
                            : AppColors.techBlue.withValues(alpha: 0.10),
                        textColor: possuiAvaria
                            ? const Color(0xFFB42318)
                            : AppColors.techBlue,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}