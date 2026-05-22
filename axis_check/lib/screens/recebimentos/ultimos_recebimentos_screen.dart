import 'package:flutter/material.dart';

import '../../core/storage/token_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../models/recebimento_resumo_model.dart';
import '../../services/recebimento_service.dart';
import '../../widgets/app_header.dart';

class UltimosRecebimentosScreen extends StatefulWidget {
  const UltimosRecebimentosScreen({super.key});

  @override
  State<UltimosRecebimentosScreen> createState() =>
      _UltimosRecebimentosScreenState();
}

class _UltimosRecebimentosScreenState extends State<UltimosRecebimentosScreen> {
  late final RecebimentoService recebimentoService;

  bool loading = true;
  String? erro;
  List<RecebimentoResumo> recebimentos = [];

  @override
  void initState() {
    super.initState();
    recebimentoService = RecebimentoService(tokenStorage: TokenStorage());
    carregarRecebimentos();
  }

  Future<void> carregarRecebimentos() async {
    setState(() {
      loading = true;
      erro = null;
    });

    try {
      final resultado = await recebimentoService.listarUltimosRecebimentos(
        usarMock: false,
      );

      if (!mounted) return;

      setState(() {
        recebimentos = resultado.take(20).toList();
        loading = false;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        erro = 'Erro ao carregar últimos recebimentos.';
        loading = false;
      });
    }
  }

  String formatarData(DateTime? data) {
    if (data == null) {
      return 'Data indisponível';
    }

    final local = data.toLocal();
    final dia = local.day.toString().padLeft(2, '0');
    final mes = local.month.toString().padLeft(2, '0');
    final ano = local.year.toString();
    final hora = local.hour.toString().padLeft(2, '0');
    final minuto = local.minute.toString().padLeft(2, '0');

    return '$dia/$mes/$ano $hora:$minuto';
  }

  String descricaoStatus(RecebimentoResumo recebimento) {
    if (recebimento.sincronizadoSynchro) {
      return 'Sincronizado com Synchro';
    }

    switch (recebimento.statusRecebimento) {
      case 'PENDENTE_SYNCHRO':
        return 'Pendente de sincronizacao';
      case 'ERRO_SYNCHRO':
        return 'Erro de sincronizacao';
      case 'SINCRONIZADO_SYNCHRO':
        return 'Sincronizado com Synchro';
      default:
        return 'Recebimento concluido';
    }
  }

  Color corStatus(RecebimentoResumo recebimento) {
    if (recebimento.sincronizadoSynchro ||
        recebimento.statusRecebimento == 'SINCRONIZADO_SYNCHRO') {
      return AppColors.primaryGreen;
    }

    if (recebimento.statusRecebimento == 'ERRO_SYNCHRO') {
      return const Color(0xFFFFC107);
    }

    return const Color(0xFFDDEBFF);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const AppHeader(
            title: 'Ultimos recebimentos',
            subtitle: 'Historico das conferencias enviadas pelo app',
            icon: Icons.history_rounded,
            showBackButton: true,
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: carregarRecebimentos,
              color: AppColors.techBlue,
              child: _buildContent(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (erro != null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 42,
                    color: AppColors.techBlue,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    erro!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 46,
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: carregarRecebimentos,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Tentar novamente'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    if (recebimentos.isEmpty) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(22),
              child: Column(
                children: [
                  Container(
                    width: 62,
                    height: 62,
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(
                      Icons.history_toggle_off_rounded,
                      size: 34,
                      color: AppColors.techBlue,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Nenhum recebimento encontrado',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Quando houver conferencias enviadas pelo app, elas aparecerao aqui.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.mutedText),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      itemCount: recebimentos.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final recebimento = recebimentos[index];

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'OS ${recebimento.numeroOs}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: AppColors.black,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            recebimento.cliente.isEmpty
                                ? 'Cliente nao informado'
                                : recebimento.cliente,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.mutedText,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: corStatus(recebimento),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        descricaoStatus(recebimento),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppColors.black,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (recebimento.descricaoOperacao.isNotEmpty) ...[
                  Text(
                    recebimento.descricaoOperacao,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _InfoChip(
                      icon: Icons.inventory_2_outlined,
                      label: '${recebimento.totalEquipamentos} equipamentos',
                    ),
                    _InfoChip(
                      icon: Icons.warning_amber_rounded,
                      label: '${recebimento.totalAvarias} com avaria',
                    ),
                    _InfoChip(
                      icon: Icons.schedule_rounded,
                      label: formatarData(recebimento.dataRecebimento),
                    ),
                  ],
                ),
                if (recebimento.statusOperacao.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    'Status da operacao: ${recebimento.statusOperacao}',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.mutedText,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.techBlue.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: AppColors.techBlue,
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.black,
            ),
          ),
        ],
      ),
    );
  }
}
