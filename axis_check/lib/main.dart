import 'package:flutter/material.dart';
import 'core/config/app_config.dart';
import 'models/app_update_info.dart';
import 'core/storage/token_storage.dart';
import 'core/theme/app_theme.dart';
import 'screens/home/home_screen.dart';
import 'screens/login/login_screen.dart';
import 'screens/update_required/update_required_screen.dart';
import 'services/app_update_service.dart';

void main() {
  runApp(const AxisCheckApp());
}

class AxisCheckApp extends StatelessWidget {
  const AxisCheckApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final AppUpdateService _appUpdateService = AppUpdateService();

  Future<bool> _carregarSessao() async {
    final token = await TokenStorage().buscarToken();
    return token != null && token.isNotEmpty;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<_BootstrapState>(
      future: _carregarEstadoInicial(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            backgroundColor: AppColors.background,
            body: Center(
              child: CircularProgressIndicator(color: AppColors.techBlue),
            ),
          );
        }

        final data = snapshot.data;

        if (data?.updateRequired != null) {
          return UpdateRequiredScreen(updateInfo: data!.updateRequired!);
        }

        if (data?.isLoggedIn == true) {
          return const HomeScreen();
        }

        return const LoginScreen();
      },
    );
  }

  Future<_BootstrapState> _carregarEstadoInicial() async {
    final isLoggedIn = await _carregarSessao();
    final updateRequired = await _buscarAtualizacaoSegura();

    return _BootstrapState(
      isLoggedIn: isLoggedIn,
      updateRequired: updateRequired,
    );
  }

  Future<AppUpdateInfo?> _buscarAtualizacaoSegura() async {
    try {
      return await _appUpdateService.buscarAtualizacaoDisponivel();
    } catch (_) {
      return null;
    }
  }
}

class _BootstrapState {
  final bool isLoggedIn;
  final AppUpdateInfo? updateRequired;

  const _BootstrapState({
    required this.isLoggedIn,
    required this.updateRequired,
  });
}
