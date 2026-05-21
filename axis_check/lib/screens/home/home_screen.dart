import 'package:flutter/material.dart';

import '../../core/storage/token_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../services/synchro_service.dart';
import '../../widgets/app_header.dart';
import '../os_list/os_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final SynchroService synchroService;

  bool carregandoResumo = true;
  int totalOsEmAndamento = 0;

  @override
  void initState() {
    super.initState();

    synchroService = SynchroService(
      tokenStorage: TokenStorage(),
    );

    carregarResumo();
  }

  Future<void> carregarResumo() async {
    try {
      final lista = await synchroService.listarOsEmAndamento(
        usarMock: false,
      );

      if (!mounted) return;

      setState(() {
        totalOsEmAndamento = lista.length;
        carregandoResumo = false;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        totalOsEmAndamento = 0;
        carregandoResumo = false;
      });
    }
  }

  void abrirOsEmAndamento() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const OsListScreen(),
      ),
    ).then((_) => carregarResumo());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const AppHeader(
            title: 'Axis Check',
            subtitle: 'Recebimento e conferência operacional',
            icon: Icons.fact_check_rounded,
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: carregarResumo,
              color: AppColors.techBlue,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 22, 20, 32),
                children: [
                  const Text(
              'Recebimento operacional',
                style: TextStyle(
                  fontSize: 27,
                  fontWeight: FontWeight.w900,
                  color: AppColors.black,
                  letterSpacing: -0.8,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Consulte as OS em andamento, confira os equipamentos retornados e registre as evidências antes do envio para manutenção.',
                style: TextStyle(
                  fontSize: 15,
                  height: 1.35,
                  color: AppColors.mutedText,
                  fontWeight: FontWeight.w500,
                ),
              ),

              const SizedBox(height: 18),

              Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryGreen,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    carregandoResumo
                        ? 'Atualizando operações...'
                        : '$totalOsEmAndamento OS disponíveis para conferência',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.black,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

                  const Text(
                    'Ações',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: AppColors.black,
                    ),
                  ),

                  const SizedBox(height: 10),

                  _HomeActionItem(
                    title: 'OS em andamento',
                    subtitle: 'Conferir equipamentos retornando da operação',
                    icon: Icons.assignment_turned_in_outlined,
                    onTap: abrirOsEmAndamento,
                  ),
                  _HomeActionItem(
                    title: 'Pendências de envio',
                    subtitle: 'Recebimentos aguardando sincronização',
                    icon: Icons.cloud_sync_outlined,
                    onTap: () {},
                  ),
                  _HomeActionItem(
                    title: 'Últimos recebimentos',
                    subtitle: 'Visualizar conferências realizadas',
                    icon: Icons.history_outlined,
                    onTap: () {},
                    showDivider: false,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HomeActionItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;
  final bool showDivider;

  const _HomeActionItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
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
                    color: AppColors.techBlue.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    icon,
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
                        title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.black,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.mutedText,
                          fontWeight: FontWeight.w500,
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
          if (showDivider)
            const Divider(
              height: 1,
              color: AppColors.border,
            ),
        ],
      ),
    );
  }
}