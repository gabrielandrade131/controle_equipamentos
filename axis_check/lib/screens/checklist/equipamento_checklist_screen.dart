import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/equipamento_operacao_model.dart';
import '../../models/foto_recebimento_model.dart';
import '../../models/checklist_recebimento_model.dart';

class EquipamentoChecklistScreen extends StatefulWidget {
  final EquipamentoOperacao equipamento;

  const EquipamentoChecklistScreen({
    super.key,
    required this.equipamento,
  });

  @override
  State<EquipamentoChecklistScreen> createState() =>
      _EquipamentoChecklistScreenState();
}

class _EquipamentoChecklistScreenState
    extends State<EquipamentoChecklistScreen> {
  final observacaoController = TextEditingController();
  final picker = ImagePicker();

  bool retornouFisicamente = false;
  bool equipamentoConferido = false;
  bool possuiAvaria = false;
  bool fotoIdentificacaoObrigatoria = false;

  final List<FotoRecebimento> fotos = [];

  Future<void> adicionarFoto(String tipo) async {
    final imagem = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 70,
      maxWidth: 1600,
    );

    if (imagem == null) {
      return;
    }

    setState(() {
      fotos.add(
        FotoRecebimento(
          path: imagem.path,
          tipo: tipo,
          criadoEm: DateTime.now(),
        ),
      );
    });
  }

  bool get podeSalvar {
    final temFotoGeral = fotos.any((foto) => foto.tipo == 'GERAL');
    final temFotoIdentificacao =
        fotos.any((foto) => foto.tipo == 'IDENTIFICACAO');

    return retornouFisicamente &&
        equipamentoConferido &&
        temFotoGeral &&
        temFotoIdentificacao;
  }

  void salvarChecklist() {
    if (!podeSalvar) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Preencha o checklist e adicione as fotos obrigatórias.',
          ),
        ),
      );
      return;
    }

    final checklist = ChecklistRecebimento(
    equipamentoId: widget.equipamento.id,
    tag: widget.equipamento.tag,
    numeroSerie: widget.equipamento.numeroSerie,
    retornouFisicamente: retornouFisicamente,
    equipamentoConferido: equipamentoConferido,
    possuiAvaria: possuiAvaria,
    observacao: observacaoController.text,
    fotos: List.from(fotos),
    criadoEm: DateTime.now(),
  );

  debugPrint('CHECKLIST SALVO: ${checklist.tag}');

  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text('Checklist salvo localmente.'),
    ),
  );

Navigator.pop(context, checklist);
}
  @override
  void dispose() {
    observacaoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final equipamento = widget.equipamento;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checklist do Equipamento'),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: SizedBox(
          height: 52,
          child: ElevatedButton.icon(
            onPressed: salvarChecklist,
            icon: const Icon(Icons.save_outlined),
            label: const Text('Salvar checklist'),
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
                    equipamento.tipoEquipamento,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _InfoLinha(label: 'Modelo', valor: equipamento.modelo),
                  _InfoLinha(
                    label: 'Número de Série',
                    valor: equipamento.numeroSerie,
                  ),
                  _InfoLinha(label: 'TAG', valor: equipamento.tag),
                  _InfoLinha(
                    label: 'Situação',
                    valor: equipamento.situacaoAtual,
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Equipamento retornou fisicamente?'),
                  subtitle: const Text('Confirma que o item chegou na base.'),
                  value: retornouFisicamente,
                  onChanged: (value) {
                    setState(() {
                      retornouFisicamente = value;
                    });
                  },
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Equipamento conferido?'),
                  subtitle: const Text('TAG/série conferidos visualmente.'),
                  value: equipamentoConferido,
                  onChanged: (value) {
                    setState(() {
                      equipamentoConferido = value;
                    });
                  },
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Possui avaria visível?'),
                  subtitle: const Text('Marcas, danos, peças faltando etc.'),
                  value: possuiAvaria,
                  onChanged: (value) {
                    setState(() {
                      possuiAvaria = value;
                    });
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          TextField(
            controller: observacaoController,
            minLines: 3,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: 'Observações',
              hintText: 'Descreva como o equipamento retornou...',
              alignLabelWithHint: true,
            ),
          ),

          const SizedBox(height: 24),

          const Text(
            'Fotos obrigatórias',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 8),

          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => adicionarFoto('GERAL'),
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: const Text('Foto geral'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => adicionarFoto('IDENTIFICACAO'),
                  icon: const Icon(Icons.badge_outlined),
                  label: const Text('Foto TAG'),
                ),
              ),
            ],
          ),

          if (possuiAvaria) ...[
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => adicionarFoto('AVARIA'),
              icon: const Icon(Icons.report_problem_outlined),
              label: const Text('Adicionar foto da avaria'),
            ),
          ],

          const SizedBox(height: 16),

          if (fotos.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'Nenhuma foto adicionada ainda.',
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: fotos.map((foto) {
                return Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(
                        File(foto.path),
                        width: 110,
                        height: 110,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      left: 6,
                      bottom: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.65),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          foto.tipo,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      right: 4,
                      top: 4,
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            fotos.remove(foto);
                          });
                        },
                        child: Container(
                          decoration: const BoxDecoration(
                            color: Colors.black54,
                            shape: BoxShape.circle,
                          ),
                          padding: const EdgeInsets.all(4),
                          child: const Icon(
                            Icons.close,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}

class _InfoLinha extends StatelessWidget {
  final String label;
  final String valor;

  const _InfoLinha({
    required this.label,
    required this.valor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.black54,
              ),
            ),
          ),
          Expanded(
            child: Text(valor),
          ),
        ],
      ),
    );
  }
}