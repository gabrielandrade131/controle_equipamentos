import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import '../models/os_operacao_model.dart';
import 'status_badge.dart';

class OsCard extends StatelessWidget {
  final OsOperacao os;
  final VoidCallback onTap;

  const OsCard({
    super.key,
    required this.os,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final totalEquipamentos = os.equipamentos.length;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: AppColors.techBlue,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(
                      Icons.assignment_outlined,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(width: 12),

                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          os.numeroOs,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w900,
                            color: AppColors.black,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          os.cliente.isEmpty ? 'Cliente não informado' : os.cliente,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.mutedText,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),

                  StatusBadge(
                    label: os.status,
                    backgroundColor: AppColors.primaryGreen.withValues(alpha: 0.35),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              Text(
                os.descricaoOperacao.isEmpty
                    ? 'Operação não informada'
                    : os.descricaoOperacao,
                style: const TextStyle(
                  color: AppColors.black,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),

              const SizedBox(height: 14),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.border,
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.precision_manufacturing_outlined,
                      size: 20,
                      color: AppColors.techBlue,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '$totalEquipamentos equipamento${totalEquipamentos == 1 ? '' : 's'}',
                      style: const TextStyle(
                        color: AppColors.black,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const Spacer(),
                    const Text(
                      'Conferir',
                      style: TextStyle(
                        color: AppColors.techBlue,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.arrow_forward_ios,
                      size: 14,
                      color: AppColors.techBlue,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}