import 'package:flutter/material.dart';

import '../../core/storage/token_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../models/os_operacao_model.dart';
import '../../services/synchro_service.dart';
import '../../widgets/app_header.dart';
import '../../widgets/os_card.dart';
import '../os_detail/os_detail_screen.dart';

class OsListScreen extends StatefulWidget {
  const OsListScreen({super.key});

  @override
  State<OsListScreen> createState() => _OsListScreenState();
}

class _OsListScreenState extends State<OsListScreen> {
  late final SynchroService synchroService;

  bool loading = true;
  String? erro;
  List<OsOperacao> osList = [];
  String filtroBusca = '';

  List<OsOperacao> get osFiltradas {
    if (filtroBusca.trim().isEmpty) {
      return osList;
    }

    final termo = filtroBusca.toLowerCase();

    return osList.where((os) {
      return os.numeroOs.toLowerCase().contains(termo) ||
        os.cliente.toLowerCase().contains(termo);
    }).toList();
  }

  @override
  void initState() {
    super.initState();

    synchroService = SynchroService(tokenStorage: TokenStorage());

    carregarOs();
  }

  Future<void> carregarOs() async {
    setState(() {
      loading = true;
      erro = null;
    });

    try {
      final resultado = await synchroService.listarOsEmAndamento(
        usarMock: true,
      );

      if (!mounted) return;

      setState(() {
        osList = resultado;
        loading = false;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        erro = 'Não foi possível carregar as OS em andamento.';
        loading = false;
      });
    }
  }

  Future<void> atualizar() async {
    await carregarOs();
  }

  void abrirDetalheOs(OsOperacao os) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => OsDetailScreen(os: os)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const AppHeader(
            title: 'OS em andamento',
            subtitle: 'Selecione uma operação para iniciar a conferência',
            icon: Icons.assignment_turned_in_outlined,
            showBackButton: true,
          ),

          Expanded(
            child: RefreshIndicator(
              onRefresh: atualizar,
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
                      onPressed: carregarOs,
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

    if (osList.isEmpty) {
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
                      Icons.inbox_outlined,
                      size: 34,
                      color: AppColors.techBlue,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Nenhuma OS em andamento',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Quando houver operações em andamento no Synchro, elas aparecerão aqui.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.mutedText),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 46,
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: carregarOs,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Atualizar'),
                    ),
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
      itemCount: osFiltradas.length + 1,
      separatorBuilder: (_, __) => const SizedBox(height: 0),
      itemBuilder: (context, index) {
        if (index == 0) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${osFiltradas.length} OS encontrada${osFiltradas.length == 1 ? '' : 's'}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.mutedText,
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                onChanged: (value) {
                  setState(() {
                    filtroBusca = value;
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Buscar OS ou cliente',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: AppColors.white,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 14,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(
                      color: AppColors.border,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(
                      color: AppColors.border,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 18),
            ],
          );
        }

        final os = osFiltradas[index - 1];

        return OsCard(
          os: os,
          onTap: () => abrirDetalheOs(os),
        );
      },
    );
  }
}
