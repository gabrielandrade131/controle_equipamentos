import 'package:flutter/material.dart';
import '../../models/equipamento_operacao_model.dart';
import '../../models/os_operacao_model.dart';
import '../os_detail/os_detail_screen.dart';

class OsListScreen extends StatelessWidget {
  const OsListScreen({super.key});

  List<OsOperacao> get osMockadas => [
        OsOperacao(
          id: '1',
          numeroOs: 'OS-001',
          cliente: 'Cliente Offshore A',
          descricaoOperacao: 'Limpeza de tanque',
          status: 'EM ANDAMENTO',
          equipamentos: [
            EquipamentoOperacao(
              id: 'eq-1',
              tipoEquipamento: 'Exaustor',
              modelo: 'CSEX420ACM',
              numeroSerie: 'CSEX420ACM-13',
              tag: 'CSEX420ACM-13',
              situacaoAtual: 'Em operação',
            ),
            EquipamentoOperacao(
              id: 'eq-2',
              tipoEquipamento: 'Bomba Pneumática',
              modelo: 'BP-200',
              numeroSerie: 'BP-200-22',
              tag: 'BP-200-22',
              situacaoAtual: 'Em operação',
            ),
          ],
        ),
        OsOperacao(
          id: '2',
          numeroOs: 'OS-002',
          cliente: 'Cliente Industrial B',
          descricaoOperacao: 'Operação de transferência',
          status: 'EM ANDAMENTO',
          equipamentos: [
            EquipamentoOperacao(
              id: 'eq-3',
              tipoEquipamento: 'Guincho Pneumático',
              modelo: 'GP-500',
              numeroSerie: 'GP-500-31',
              tag: 'GP-500-31',
              situacaoAtual: 'Em operação',
            ),
          ],
        ),
      ];

  @override
  Widget build(BuildContext context) {
    final osList = osMockadas;

    return Scaffold(
      appBar: AppBar(
        title: const Text('OS em andamento'),
      ),
      body: ListView.separated(
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
                  '${os.cliente}\n${os.descricaoOperacao}\nEquipamentos: ${os.equipamentos.length}',
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
      ),
    );
  }
}
