import 'package:flutter/material.dart';

import '../../core/storage/token_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../services/synchro_service.dart';
import '../../widgets/action_card.dart';
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
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text(
                  'Visão geral',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: AppColors.border,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(
                          Icons.assignment_outlined,
                          color: AppColors.techBlue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              carregandoResumo
                                  ? 'Carregando OS...'
                                  : '$totalOsEmAndamento OS em andamento',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: AppColors.black,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Acompanhe e inicie a conferência dos equipamentos retornando da operação.',
                              style: TextStyle(
                                color: AppColors.mutedText,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Ações rápidas',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 12),
                ActionCard(
                  title: 'OS em andamento',
                  subtitle: 'Conferir equipamentos retornando da operação',
                  icon: Icons.assignment_turned_in_outlined,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const OsListScreen(),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                ActionCard(
                  title: 'Pendências de envio',
                  subtitle: 'Recebimentos aguardando sincronização',
                  icon: Icons.cloud_sync_outlined,
                  onTap: () {},
                ),
                const SizedBox(height: 12),
                ActionCard(
                  title: 'Últimos recebimentos',
                  subtitle: 'Visualizar conferências já realizadas',
                  icon: Icons.history_outlined,
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
