import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/os_operacao_model.dart';

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

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 14),
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: AppColors.border,
            ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.techBlue.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(
                Icons.assignment_outlined,
                color: AppColors.techBlue,
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'OS ${os.numeroOs}',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    os.cliente.isEmpty ? 'Cliente não informado' : os.cliente,
                    style: const TextStyle(
                      color: AppColors.mutedText,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          os.status.isEmpty ? 'Sem status' : os.status,
                          style: const TextStyle(
                            color: AppColors.black,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '$totalEquipamentos equipamento${totalEquipamentos == 1 ? '' : 's'}',
                        style: const TextStyle(
                          color: AppColors.mutedText,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Icon(
                Icons.chevron_right_rounded,
                color: AppColors.mutedText,
                size: 24,
              ),
            ),
          ],
        ),
      ),
    );
  }
}