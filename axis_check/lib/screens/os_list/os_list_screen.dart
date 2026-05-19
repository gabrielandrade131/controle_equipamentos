import 'package:flutter/material.dart';

import '../../core/storage/token_storage.dart';
import '../../models/os_operacao_model.dart';
import '../../services/synchro_service.dart';
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

  @override
  void initState() {
    super.initState();

    synchroService = SynchroService(
      tokenStorage: TokenStorage(),
    );

    carregarOs();
  }

  Future<void> carregarOs() async {
    setState(() {
      loading = true;
      erro = null;
    });

    final resultado = await synchroService.listarOsEmAndamento(
      usarMock: true,
    );

    if (!mounted) return;

    setState(() {
      osList = resultado;
      loading = false;
    });
  }

  Future<void> atualizar() async {
    await carregarOs();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OS em andamento'),
      ),
      body: RefreshIndicator(
        onRefresh: atualizar,
        child: _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    if (loading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (erro != null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(erro!),
            ),
          ),
        ],
      );
    }

    if (osList.isEmpty) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('Nenhuma OS em andamento encontrada.'),
            ),
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: osList.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final os = osList[index];

        return Card(
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: const CircleAvatar(
              child: Icon(Icons.assignment_outlined),
            ),
            title: Text(
              os.numeroOs,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                '${os.cliente}\n'
                '${os.descricaoOperacao}\n'
                'Equipamentos: ${os.equipamentos.length}',
              ),
            ),
            isThreeLine: true,
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => OsDetailScreen(os: os),
                ),
              );
            },
          ),
        );
      },
    );
  }
}