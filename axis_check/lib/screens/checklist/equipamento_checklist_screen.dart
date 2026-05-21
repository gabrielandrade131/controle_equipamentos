import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../models/checklist_recebimento_model.dart';
import '../../models/equipamento_operacao_model.dart';
import '../../models/foto_recebimento_model.dart';
import '../../widgets/app_header.dart';

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

  int get fotosGerais => fotos.where((foto) => foto.tipo == 'GERAL').length;

  int get fotosIdentificacao =>
      fotos.where((foto) => foto.tipo == 'IDENTIFICACAO').length;

  int get fotosAvaria => fotos.where((foto) => foto.tipo == 'AVARIA').length;

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

  void adicionarFoto(String tipo) {
    final foto = FotoRecebimento(
      path:
          'mock_${widget.equipamento.tag}_${tipo}_${DateTime.now().millisecondsSinceEpoch}.jpg',
      tipo: tipo,
      criadoEm: DateTime.now(),
    );

    setState(() {
      fotos.add(foto);
    });

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
            'Confirme o checklist e adicione as fotos obrigatórias.',
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
          child: ElevatedButton(
            onPressed: podeSalvar ? salvarChecklist : null,
            child: const Text('Salvar checklist'),
          ),
        ),
      ),
      body: Column(
        children: [
          AppHeader(
            title: equipamento.tipoEquipamento,
            subtitle: 'Checklist e fotos do equipamento',
            icon: Icons.fact_check_rounded,
            showBackButton: true,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 90),
              children: [
                const Text(
                  'Recebimento',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: AppColors.black,
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  equipamento.tag.isEmpty
                      ? 'Confira os dados e registre as evidências'
                      : 'TAG ${equipamento.tag} • Série ${equipamento.numeroSerie}',
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.mutedText,
                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(height: 26),

                _SectionTitle(
                  title: 'Equipamento',
                ),
                    const SizedBox(height: 10),
                    _InfoLine(label: 'Modelo', value: equipamento.modelo),
                    _InfoLine(label: 'Série', value: equipamento.numeroSerie),
                    _InfoLine(
                      label: 'Situação',
                      value: equipamento.situacaoAtual,
                      showDivider: false,
                    ),

                    const SizedBox(height: 30),

                    _SectionTitle(
                      title: 'Checklist',
                    ),
                    const SizedBox(height: 8),
                    _SwitchLine(
                      title: 'Retornou fisicamente',
                      subtitle: 'O equipamento chegou à base.',
                      value: retornouFisicamente,
                      onChanged: (value) {
                        setState(() {
                          retornouFisicamente = value;
                        });
                      },
                    ),
                    _SwitchLine(
                      title: 'Equipamento conferido',
                      subtitle: 'TAG, série e modelo foram verificados.',
                      value: equipamentoConferido,
                      onChanged: (value) {
                        setState(() {
                          equipamentoConferido = value;
                        });
                      },
                    ),
                    _SwitchLine(
                      title: 'Possui avaria',
                      subtitle: 'Existe dano, falta ou irregularidade.',
                      value: possuiAvaria,
                      onChanged: (value) {
                        setState(() {
                          possuiAvaria = value;
                        });
                      },
                      showDivider: false,
                    ),

                    const SizedBox(height: 30),

                    _SectionTitle(
                      title: 'Fotos obrigatórias',
                    ),
                    const SizedBox(height: 8),
                    _PhotoLine(
                      title: 'Foto geral',
                      subtitle: 'Obrigatória',
                      quantidade: fotosGerais,
                      onTap: () => adicionarFoto('GERAL'),
                    ),
                    _PhotoLine(
                      title: 'Identificação / TAG',
                      subtitle: 'Obrigatória',
                      quantidade: fotosIdentificacao,
                      onTap: () => adicionarFoto('IDENTIFICACAO'),
                      showDivider: !possuiAvaria,
                    ),
                    if (possuiAvaria)
                      _PhotoLine(
                        title: 'Foto da avaria',
                        subtitle: 'Obrigatória quando houver avaria',
                        quantidade: fotosAvaria,
                        onTap: () => adicionarFoto('AVARIA'),
                        showDivider: false,
                    ),

                const SizedBox(height: 24),

                const Text(
                  'Observações',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.black,
                  ),
                ),

                const SizedBox(height: 12),

                TextField(
                  controller: observacaoController,
                  minLines: 4,
                  maxLines: 6,
                  decoration: const InputDecoration(
                    hintText: 'Descreva a condição do equipamento...',
                  ),
                ),

                if (!podeSalvar) ...[
                  const SizedBox(height: 18),
                  const Text(
                    'Para salvar, confirme o checklist e adicione as fotos obrigatórias.',
                    style: TextStyle(
                      color: AppColors.mutedText,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w900,
        color: AppColors.black,
        letterSpacing: -0.2,
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  final String label;
  final String value;
  final bool showDivider;

  const _InfoLine({
    required this.label,
    required this.value,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.mutedText,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Flexible(
                child: Text(
                  value.isEmpty ? '-' : value,
                  textAlign: TextAlign.end,
                  style: const TextStyle(
                    color: AppColors.black,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (showDivider)
          const Divider(
            height: 1,
            color: AppColors.border,
          ),
      ],
    );
  }
}

class _SwitchLine extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool showDivider;

  const _SwitchLine({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 13),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: AppColors.black,
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: AppColors.mutedText,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: value,
                activeColor: AppColors.primaryGreen,
                activeTrackColor: AppColors.techBlue,
                onChanged: onChanged,
              ),
            ],
          ),
        ),
        if (showDivider)
          const Divider(
            height: 1,
            color: AppColors.border,
          ),
      ],
    );
  }
}

class _PhotoLine extends StatelessWidget {
  final String title;
  final String subtitle;
  final int quantidade;
  final VoidCallback onTap;
  final bool showDivider;

  const _PhotoLine({
    required this.title,
    required this.subtitle,
    required this.quantidade,
    required this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final temFoto = quantidade > 0;

    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 13),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: temFoto
                        ? AppColors.primaryGreen.withValues(alpha: 0.28)
                        : AppColors.techBlue.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    temFoto ? Icons.check_rounded : Icons.camera_alt_outlined,
                    color: temFoto ? AppColors.black : AppColors.techBlue,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: AppColors.black,
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        temFoto ? '$quantidade foto(s)' : subtitle,
                        style: const TextStyle(
                          color: AppColors.mutedText,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.camera_alt_outlined,
                  color: AppColors.techBlue,
                  size: 21,
                ),
              ],
            ),
          ),
        ),
        if (showDivider)
          const Divider(
            height: 1,
            color: AppColors.border,
          ),
      ],
    );
  }
}