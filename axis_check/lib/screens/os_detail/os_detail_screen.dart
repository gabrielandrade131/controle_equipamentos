import 'package:flutter/material.dart';

import '../../models/checklist_recebimento_model.dart';
import '../../models/equipamento_operacao_model.dart';
import '../../models/os_operacao_model.dart';
import '../checklist/equipamento_checklist_screen.dart';
import 'finalizar_recebimento_screen.dart';

class OsDetailScreen extends StatefulWidget {
  final OsOperacao os;

  const OsDetailScreen({
    super.key,
    required this.os,
  });

  @override
  State<OsDetailScreen> createState() => _OsDetailScreenState();
}

class _OsDetailScreenState extends State<OsDetailScreen> {
  final Map<String, ChecklistRecebimento> checklistsPorEquipamento = {};

  bool get todosEquipamentosConferidos {
    return checklistsPorEquipamento.length == widget.os.equipamentos.length;
  }

  int get totalConferidos => checklistsPorEquipamento.length;

  Future<void> abrirChecklist(EquipamentoOperacao equipamento) async {
    final checklist = await Navigator.push<ChecklistRecebimento>(
      context,
      MaterialPageRoute(
        builder: (_) => EquipamentoChecklistScreen(
          equipamento: equipamento,
        ),
      ),
    );

    if (checklist == null) {
      return;
    }

    setState(() {
      checklistsPorEquipamento[equipamento.id] = checklist;
    });
  }

  void finalizarRecebimento() {
    if (!todosEquipamentosConferidos) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Todos os equipamentos precisam ter checklist e fotos antes de finalizar.',
          ),
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => FinalizarRecebimentoScreen(
          os: widget.os,
          checklistsPorEquipamento: checklistsPorEquipamento,
        ),
      ),
    );
  }

  void marcarTodosRetornaram() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Agora faça o checklist e as fotos de cada equipamento para finalizar.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final os = widget.os;

    return Scaffold(
      appBar: AppBar(
        title: Text(os.numeroOs),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: SizedBox(
          height: 52,
          child: ElevatedButton.icon(
            onPressed: todosEquipamentosConferidos ? finalizarRecebimento : null,
            icon: const Icon(Icons.cloud_upload_outlined),
            label: Text(
              todosEquipamentosConferidos
                  ? 'Finalizar recebimento'
                  : 'Checklist pendente ($totalConferidos/${os.equipamentos.length})',
            ),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    os.numeroOs,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Cliente: ${os.cliente}'),
                  Text('Operação: ${os.descricaoOperacao}'),
                  Text('Status: ${os.status}'),
                  Text('Equipamentos: ${os.equipamentos.length}'),
                  Text('Conferidos: $totalConferidos/${os.equipamentos.length}'),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: marcarTodosRetornaram,
              icon: const Icon(Icons.done_all),
              label: const Text('Todos os equipamentos retornaram'),
            ),
          ),

          const SizedBox(height: 24),

          const Text(
            'Equipamentos da operação',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 12),

          ...os.equipamentos.map(
            (equipamento) {
              final checklist = checklistsPorEquipamento[equipamento.id];
              final conferido = checklist != null;

              return Card(
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: conferido ? Colors.green : null,
                    child: Icon(
                      conferido
                          ? Icons.check
                          : Icons.precision_manufacturing_outlined,
                      color: conferido ? Colors.white : null,
                    ),
                  ),
                  title: Text(
                    equipamento.tipoEquipamento,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      'Modelo: ${equipamento.modelo}\n'
                      'Série: ${equipamento.numeroSerie}\n'
                      'TAG: ${equipamento.tag}\n'
                      'Status: ${conferido ? 'Conferido' : 'Pendente'}',
                    ),
                  ),
                  isThreeLine: true,
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () => abrirChecklist(equipamento),
                ),
              );
            },
          ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}