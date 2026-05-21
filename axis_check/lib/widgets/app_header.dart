import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class AppHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData? icon;
  final bool showBackButton;

  const AppHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.icon,
    this.showBackButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 22),
      decoration: const BoxDecoration(
        color: AppColors.techBlue,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (showBackButton) ...[
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.white.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: AppColors.white,
                    size: 18,
                  ),
                ),
              ),
              const SizedBox(height: 18),
            ],
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Icon(
                      icon,
                      color: AppColors.black,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 14),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}