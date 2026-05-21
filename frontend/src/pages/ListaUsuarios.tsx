import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosConfig';
import './ListaUsuarios.css';
import AlertModal from '../components/AlertModal';
import ModalEditarUsuario from '../components/ModalEditarUsuario';
import ModalConfirmacao from '../components/ModalConfirmacao';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  precisaTrocarSenha: boolean;
  criadoEm: string;
}

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ListaUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioDeletando, setUsuarioDeletando] = useState<Usuario | null>(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirmarDelecao, setModalConfirmarDelecao] = useState(false);

  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const titles: Record<string, string> = {
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Informação',
    };

    setAlert({
      isOpen: true,
      title: titles[type],
      message,
      type,
    });
  }, []);

  const carregarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users');
      setUsuarios(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar usuários';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setModalEditar(true);
  };

  const fecharModalEditar = () => {
    setModalEditar(false);
    setUsuarioEditando(null);
  };

  const salvarUsuario = async (usuarioAtualizado: Partial<Usuario>) => {
    if (!usuarioAtualizado.id) return;

    setLoadingAction(true);
    try {
      await axiosInstance.put(`/users/${usuarioAtualizado.id}`, {
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        ativo: usuarioAtualizado.ativo,
        precisaTrocarSenha: usuarioAtualizado.precisaTrocarSenha,
      });

      showAlert('Usuário atualizado com sucesso!', 'success');
      fecharModalEditar();
      carregarUsuarios();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar usuário';
      showAlert(errorMessage, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const abrirModalDelecao = (usuario: Usuario) => {
    setUsuarioDeletando(usuario);
    setModalConfirmarDelecao(true);
  };

  const fecharModalDelecao = () => {
    setModalConfirmarDelecao(false);
    setUsuarioDeletando(null);
  };

  const deletarUsuario = async () => {
    if (!usuarioDeletando) return;

    setLoadingAction(true);
    try {
      await axiosInstance.delete(`/users/${usuarioDeletando.id}`);

      showAlert('Usuário deletado com sucesso!', 'success');
      fecharModalDelecao();
      carregarUsuarios();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao deletar usuário';
      showAlert(errorMessage, 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="lista-usuarios-container">
      <div className="lista-usuarios-header">
        <h1>Gerenciamento de Usuários</h1>
        <button
          className="btn-novo-usuario"
          onClick={() => window.location.href = '/usuarios/cadastro'}
        >
          + Novo Usuário
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <p>Carregando usuários...</p>
        </div>
      ) : usuarios.length > 0 ? (
        <div className="usuarios-table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Data Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`status ${usuario.ativo ? 'ativo' : 'inativo'}`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{formatarData(usuario.criadoEm)}</td>
                  <td>
                    <div className="acoes">
                      <button 
                        className="btn-editar" 
                        title="Editar"
                        onClick={() => abrirModalEditar(usuario)}
                      >
                        ✎
                      </button>
                      <button 
                        className="btn-deletar" 
                        title="Deletar"
                        onClick={() => abrirModalDelecao(usuario)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="vazio">
          <p>Nenhum usuário cadastrado</p>
          <button
            className="btn-novo-usuario-grande"
            onClick={() => window.location.href = '/usuarios/cadastro'}
          >
            Cadastrar Primeiro Usuário
          </button>
        </div>
      )}

      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      <ModalEditarUsuario
        isOpen={modalEditar}
        usuario={usuarioEditando}
        onClose={fecharModalEditar}
        onSave={salvarUsuario}
        loading={loadingAction}
      />

      <ModalConfirmacao
        isOpen={modalConfirmarDelecao}
        title="Deletar Usuário"
        message={`Tem certeza que deseja deletar o usuário "${usuarioDeletando?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={deletarUsuario}
        onCancel={fecharModalDelecao}
        loading={loadingAction}
        buttonConfirmText="Deletar"
        buttonCancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
};

export default ListaUsuarios;
