import 'package:flutter/material.dart';

import '../../widgets/action_card.dart';
import '../../widgets/app_header.dart';
import '../../widgets/metric_card.dart';
import '../os_list/os_list_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

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

                const Row(
                  children: [
                    Expanded(
                      child: MetricCard(
                        title: 'OS em andamento',
                        value: '2',
                        icon: Icons.assignment_outlined,
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: MetricCard(
                        title: 'Pendências',
                        value: '0',
                        icon: Icons.sync_problem_outlined,
                      ),
                    ),
                  ],
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