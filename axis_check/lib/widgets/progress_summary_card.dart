import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';

class ProgressSummaryCard extends StatelessWidget {
  final int total;
  final int concluido;

  const ProgressSummaryCard({
    super.key,
    required this.total,
    required this.concluido,
  });

  double get progresso {
    if (total == 0) return 0;
    return concluido / total;
  }

  @override
  Widget build(BuildContext context) {
    final percentual = (progresso * 100).round();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Progresso da conferência',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$concluido de $total equipamentos conferidos',
              style: const TextStyle(
                color: AppColors.mutedText,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progresso,
                minHeight: 12,
                backgroundColor: AppColors.border,
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppColors.primaryGreen,
                ),
              ),
            ),
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                '$percentual%',
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  color: AppColors.techBlue,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}