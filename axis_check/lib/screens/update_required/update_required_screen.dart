import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../models/app_update_info.dart';
import '../../services/app_update_service.dart';

class UpdateRequiredScreen extends StatefulWidget {
  final AppUpdateInfo updateInfo;

  const UpdateRequiredScreen({super.key, required this.updateInfo});

  @override
  State<UpdateRequiredScreen> createState() => _UpdateRequiredScreenState();
}

class _UpdateRequiredScreenState extends State<UpdateRequiredScreen> {
  final AppUpdateService _appUpdateService = AppUpdateService();
  bool _openingDownload = false;

  Future<void> _abrirAtualizacao() async {
    if (_openingDownload) {
      return;
    }

    setState(() {
      _openingDownload = true;
    });

    final abriu = await _appUpdateService.abrirDownload(
      widget.updateInfo.downloadUrl,
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _openingDownload = false;
    });

    if (!abriu) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nao foi possivel abrir o download da atualizacao.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(
                  Icons.system_update_alt_rounded,
                  size: 32,
                  color: AppColors.black,
                ),
              ),
              const SizedBox(height: 28),
              const Text(
                'Atualizacao obrigatoria',
                style: TextStyle(
                  color: AppColors.black,
                  fontSize: 29,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.8,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Existe uma nova versao do Axis Check disponivel. Atualize o app para continuar usando.',
                style: const TextStyle(
                  color: AppColors.mutedText,
                  fontSize: 15,
                  height: 1.35,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Versao ${widget.updateInfo.version} (${widget.updateInfo.buildNumber})',
                      style: const TextStyle(
                        color: AppColors.black,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if ((widget.updateInfo.notes ?? '').trim().isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Text(
                        widget.updateInfo.notes!.trim(),
                        style: const TextStyle(
                          color: AppColors.mutedText,
                          fontSize: 14,
                          height: 1.4,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _openingDownload ? null : _abrirAtualizacao,
                  child: _openingDownload
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.black,
                          ),
                        )
                      : const Text('Atualizar agora'),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Ao concluir a instalacao, abra novamente o app.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.mutedText,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
