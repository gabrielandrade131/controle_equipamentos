import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';

class FotoActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final int quantidade;
  final VoidCallback onTap;
  final bool obrigatoria;

  const FotoActionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.quantidade,
    required this.onTap,
    this.obrigatoria = false,
  });

  @override
  Widget build(BuildContext context) {
    final temFoto = quantidade > 0;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: temFoto
                      ? AppColors.primaryGreen
                      : AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: temFoto
                        ? AppColors.primaryGreen
                        : AppColors.border,
                  ),
                ),
                child: Icon(
                  temFoto ? Icons.check_rounded : icon,
                  color: temFoto ? AppColors.black : AppColors.techBlue,
                ),
              ),

              const SizedBox(width: 14),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            title,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        if (obrigatoria) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 7,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.techBlue.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              'Obrigatória',
                              style: TextStyle(
                                color: AppColors.techBlue,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      temFoto
                          ? '$quantidade foto(s) adicionada(s)'
                          : subtitle,
                      style: const TextStyle(
                        color: AppColors.mutedText,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),

              const Icon(
                Icons.camera_alt_outlined,
                color: AppColors.techBlue,
              ),
            ],
          ),
        ),
      ),
    );
  }
}