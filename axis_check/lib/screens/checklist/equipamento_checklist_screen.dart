import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/theme/app_theme.dart';
import '../../models/checklist_recebimento_model.dart';
import '../../models/equipamento_operacao_model.dart';
import '../../models/foto_recebimento_model.dart';
import '../../widgets/app_header.dart';
import '../../widgets/checklist_option_card.dart';
import '../../widgets/foto_action_card.dart';

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
  bool retornouFisicamente = false;
  bool equipamentoConferido = false;
  bool possuiAvaria = false;

  final TextEditingController observacaoController = TextEditingController();

  final List<FotoRecebimento> fotos = [];

  int get fotosGerais =>
      fotos.where((foto) => foto.tipo == 'GERAL').length;

  int get fotosIdentificacao =>
      fotos.where((foto) => foto.tipo == 'IDENTIFICACAO').length;

  int get fotosAvaria =>
      fotos.where((foto) => foto.tipo == 'AVARIA').length;

  bool get podeSalvar {
    final checklistOk = retornouFisicamente && equipamentoConferido;
    final fotosObrigatoriasOk = fotosGerais > 0 && fotosIdentificacao > 0;
    final avariaOk = !possuiAvaria || fotosAvaria > 0;

    return checklistOk && fotosObrigatoriasOk && avariaOk;
  }

  @override
  void dispose() {
    observacaoController.dispose();
    super.dispose();
  }

  Future<void> adicionarFoto(String tipo) async {
    final picker = ImagePicker();

    final imagem = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 75,
    );

    if (imagem == null) {
      return;
    }

    final foto = FotoRecebimento(
      path: imagem.path,
      tipo: tipo,
      criadoEm: DateTime.now(),
    );

    setState(() {
      fotos.add(foto);
    });

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Foto $tipo adicionada.'),
      ),
    );
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
      observacao: observacaoController.text.trim(),
      fotos: List.from(fotos),
      criadoEm: DateTime.now(),
    );

    Navigator.pop(context, checklist);
  }

  @override
  Widget build(BuildContext context) {
    final equipamento = widget.equipamento;

    return Scaffold(
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: SizedBox(
          height: 54,
          child: ElevatedButton.icon(
            onPressed: podeSalvar ? salvarChecklist : null,
            icon: const Icon(Icons.check_circle_outline),
            label: const Text('Salvar checklist'),
          ),
        ),
      ),
      body: Column(
        children: [
          AppHeader(
            title: equipamento.tipoEquipamento,
            subtitle: 'Checklist e fotos do equipamento',
            icon: Icons.fact_check_rounded,
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Dados do equipamento',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 14),
                        _InfoLinha(
                          label: 'Modelo',
                          valor: equipamento.modelo,
                        ),
                        _InfoLinha(
                          label: 'Série',
                          valor: equipamento.numeroSerie,
                        ),
                        _InfoLinha(
                          label: 'TAG',
                          valor: equipamento.tag,
                        ),
                        _InfoLinha(
                          label: 'Situação',
                          valor: equipamento.situacaoAtual,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 22),

                const Text(
                  'Checklist',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),

                ChecklistOptionCard(
                  title: 'Retornou fisicamente',
                  subtitle: 'Confirme que o equipamento chegou à base.',
                  icon: Icons.local_shipping_outlined,
                  value: retornouFisicamente,
                  onChanged: (value) {
                    setState(() {
                      retornouFisicamente = value;
                    });
                  },
                ),

                const SizedBox(height: 12),

                ChecklistOptionCard(
                  title: 'Equipamento conferido',
                  subtitle: 'Confirme TAG, série, modelo e identificação.',
                  icon: Icons.verified_outlined,
                  value: equipamentoConferido,
                  onChanged: (value) {
                    setState(() {
                      equipamentoConferido = value;
                    });
                  },
                ),

                const SizedBox(height: 12),

                ChecklistOptionCard(
                  title: 'Possui avaria',
                  subtitle: 'Marque caso exista dano, falta ou irregularidade.',
                  icon: Icons.report_problem_outlined,
                  value: possuiAvaria,
                  onChanged: (value) {
                    setState(() {
                      possuiAvaria = value;
                    });
                  },
                ),

                const SizedBox(height: 22),

                const Text(
                  'Fotos obrigatórias',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),

                FotoActionCard(
                  title: 'Foto geral',
                  subtitle: 'Tire uma foto geral do equipamento.',
                  icon: Icons.photo_camera_outlined,
                  quantidade: fotosGerais,
                  obrigatoria: true,
                  onTap: () => adicionarFoto('GERAL'),
                ),

                const SizedBox(height: 12),

                FotoActionCard(
                  title: 'Foto da identificação/TAG',
                  subtitle: 'Tire uma foto mostrando TAG ou número de série.',
                  icon: Icons.badge_outlined,
                  quantidade: fotosIdentificacao,
                  obrigatoria: true,
                  onTap: () => adicionarFoto('IDENTIFICACAO'),
                ),

                if (possuiAvaria) ...[
                  const SizedBox(height: 12),
                  FotoActionCard(
                    title: 'Foto da avaria',
                    subtitle: 'Registre visualmente o dano encontrado.',
                    icon: Icons.warning_amber_rounded,
                    quantidade: fotosAvaria,
                    obrigatoria: true,
                    onTap: () => adicionarFoto('AVARIA'),
                  ),
                ],

                const SizedBox(height: 22),

                const Text(
                  'Observações',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: observacaoController,
                  minLines: 4,
                  maxLines: 6,
                  decoration: const InputDecoration(
                    hintText:
                        'Descreva a condição do equipamento, avarias, peças faltantes ou observações importantes.',
                    alignLabelWithHint: true,
                  ),
                ),

                const SizedBox(height: 16),

                if (!podeSalvar)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.techBlue.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.techBlue.withValues(alpha: 0.18),
                      ),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: AppColors.techBlue,
                        ),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Para salvar, confirme o checklist e adicione pelo menos a foto geral e a foto de identificação.',
                            style: TextStyle(
                              color: AppColors.techBlue,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 80),
              ],
            ),
          ),
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
    final valorTratado = valor.isEmpty ? 'Não informado' : valor;

    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 92,
            child: Text(
              '$label:',
              style: const TextStyle(
                color: AppColors.mutedText,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Expanded(
            child: Text(
              valorTratado,
              style: const TextStyle(
                color: AppColors.black,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
