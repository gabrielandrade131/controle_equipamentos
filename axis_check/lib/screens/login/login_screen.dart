import 'package:flutter/material.dart';

import '../../core/storage/token_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../home/home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final senhaController = TextEditingController();

  late final AuthService authService;

  bool loading = false;
  bool ocultarSenha = true;

  @override
  void initState() {
    super.initState();

    authService = AuthService(
      tokenStorage: TokenStorage(),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    senhaController.dispose();
    super.dispose();
  }

  Future<void> entrar() async {
    final email = emailController.text.trim();
    final senha = senhaController.text.trim();

    if (email.isEmpty || senha.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Informe e-mail e senha.'),
        ),
      );
      return;
    }

    setState(() {
      loading = true;
    });

    final sucesso = await authService.login(
      email: email,
      senha: senha,
    );

    if (!mounted) return;

    setState(() {
      loading = false;
    });

    if (!sucesso) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Login inválido ou erro ao conectar com o Axis.'),
        ),
      );
      return;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => const HomeScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 34, 24, 24),
          children: [
            Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: const Icon(
                    Icons.fact_check_rounded,
                    color: AppColors.black,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 14),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Axis Check',
                      style: TextStyle(
                        color: AppColors.black,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Recebimento operacional',
                      style: TextStyle(
                        color: AppColors.mutedText,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 62),

            const Text(
              'Acessar sistema',
              style: TextStyle(
                color: AppColors.black,
                fontSize: 31,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.9,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'Entre para conferir operações, registrar evidências e enviar equipamentos para manutenção.',
              style: TextStyle(
                color: AppColors.mutedText,
                fontSize: 15,
                height: 1.35,
                fontWeight: FontWeight.w500,
              ),
            ),

            const SizedBox(height: 34),

            TextField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'E-mail',
                hintText: 'seu.email@empresa.com',
                prefixIcon: Icon(Icons.mail_outline),
              ),
            ),

            const SizedBox(height: 14),

            TextField(
              controller: senhaController,
              obscureText: ocultarSenha,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => entrar(),
              decoration: InputDecoration(
                labelText: 'Senha',
                hintText: 'Digite sua senha',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  onPressed: () {
                    setState(() {
                      ocultarSenha = !ocultarSenha;
                    });
                  },
                  icon: Icon(
                    ocultarSenha
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: loading ? null : entrar,
                child: loading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.black,
                        ),
                      )
                    : const Text('Entrar'),
              ),
            ),

            const SizedBox(height: 28),

            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.primaryGreen,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Ambiente integrado ao Axis e ao Synchro.',
                    style: TextStyle(
                      color: AppColors.mutedText,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 80),

            const Center(
              child: Text(
                'Axis Check • Ambipar Response',
                style: TextStyle(
                  color: AppColors.mutedText,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}