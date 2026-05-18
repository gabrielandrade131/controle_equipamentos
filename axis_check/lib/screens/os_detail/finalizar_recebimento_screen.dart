import 'package:flutter/material.dart';

import '../../models/checklist_recebimento_model.dart';
import '../../models/os_operacao_model.dart';

class FinalizarRecebimentoScreen extends StatelessWidget {
  final OsOperacao os;
  final Map<String, ChecklistRecebimento> checklistsPorEquipamento;

  const FinalizarRecebimentoScreen({
    super.key,
    required this.os,
    required this.checklistsPorEquipamento,
  });

  int get totalFotos {
    return checklistsPorEquipamento.values.fold(
      0,
      (total, checklist) => total + checklist.fotos.length,
    );
  }

  int get totalComAvaria {
    return checklistsPorEquipamento.values
        .where((checklist) => checklist.possuiAvaria)
        .length;
  }

  void confirmarEnvio(BuildContext context) {
    final payload = {
      'osId': os.id,
      'numeroOs': os.numeroOs,
      'cliente': os.cliente,
      'descricaoOperacao': os.descricaoOperacao,
      'status': os.status,
      'dataRecebimento': DateTime.now().toIso8601String(),
      'equipamentos': checklistsPorEquipamento.values.map((checklist) {
        return {
          'equipamentoId': checklist.equipamentoId,
          'tag': checklist.tag,
          'numeroSerie': checklist.numeroSerie,
          'retornouFisicamente': checklist.retornouFisicamente,
          'equipamentoConferido': checklist.equipamentoConferido,
          'possuiAvaria': checklist.possuiAvaria,
          'observacao': checklist.observacao,
          'fotos': checklist.fotos.map((foto) {
            return {
              'path': foto.path,
              'tipo': foto.tipo,
              'criadoEm': foto.criadoEm.toIso8601String(),
            };
          }).toList(),
        };
      }).toList(),
    };

    debugPrint('ENVIAR PARA AXIS: $payload');

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Recebimento pronto para envio ao Axis.'),
      ),
    );

    Navigator.popUntil(context, (route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    final equipamentos = checklistsPorEquipamento.values.toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Finalizar Recebimento'),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: SizedBox(
          height: 52,
          child: ElevatedButton.icon(
            onPressed: () => confirmarEnvio(context),
            icon: const Icon(Icons.send_outlined),
            label: const Text('Confirmar envio para o Axis'),
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
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _ResumoCard(
                  titulo: 'Equipamentos',
                  valor: '${equipamentos.length}',
                  icone: Icons.precision_manufacturing_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ResumoCard(
                  titulo: 'Fotos',
                  valor: '$totalFotos',
                  icone: Icons.photo_camera_outlined,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _ResumoCard(
                  titulo: 'Com avaria',
                  valor: '$totalComAvaria',
                  icone: Icons.report_problem_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ResumoCard(
                  titulo: 'Conferidos',
                  valor: '${equipamentos.length}/${os.equipamentos.length}',
                  icone: Icons.check_circle_outline,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          const Text(
            'Equipamentos conferidos',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 12),

          ...equipamentos.map((checklist) {
            return Card(
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                leading: CircleAvatar(
                  backgroundColor:
                      checklist.possuiAvaria ? Colors.orange : Colors.green,
                  child: Icon(
                    checklist.possuiAvaria
                        ? Icons.warning_amber_rounded
                        : Icons.check,
                    color: Colors.white,
                  ),
                ),
                title: Text(
                  checklist.tag,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    'Série: ${checklist.numeroSerie}\n'
                    'Avaria: ${checklist.possuiAvaria ? 'Sim' : 'Não'}\n'
                    'Fotos: ${checklist.fotos.length}\n'
                    'Obs: ${checklist.observacao.isEmpty ? '-' : checklist.observacao}',
                  ),
                ),
                isThreeLine: true,
              ),
            );
          }),

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}

class _ResumoCard extends StatelessWidget {
  final String titulo;
  final String valor;
  final IconData icone;

  const _ResumoCard({
    required this.titulo,
    required this.valor,
    required this.icone,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            Icon(icone, size: 28),
            const SizedBox(height: 8),
            Text(
              valor,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              titulo,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.black54),
            ),
          ],
        ),
      ),
    );
  }
}