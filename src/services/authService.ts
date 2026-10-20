import {
  createUserWithEmailAndPassword,
<<<<<<< Updated upstream
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "./firebase/firebase";

export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  criadoEm?: any;
}

export default class AuthService {
  /**
   * Cadastra usuário no Firebase Authentication
   * e cria o documento correspondente no Firestore.
   */
  async cadastrar(
    nome: string,
    email: string,
    senha: string,
  ): Promise<Usuario> {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      senha,
    );

    const user = credential.user;

    const usuario: Usuario = {
      uid: user.uid,
      nome: nome.trim(),
      email: user.email ?? email.trim(),
    };

    await setDoc(doc(db, "usuarios", user.uid), {
      ...usuario,
      criadoEm: serverTimestamp(),
    });

    return usuario;
  }

  /**
   * Faz login com e-mail e senha.
   */
  async login(email: string, senha: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email.trim(), senha);
  }

  /**
   * Encerra a sessão atual.
   */
  async logout(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Envia e-mail para redefinição de senha.
   */
  async recuperarSenha(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  }

  /**
   * Retorna o usuário atualmente autenticado.
   */
  getUsuarioAtual(): User | null {
    return auth.currentUser;
  }

  /**
   * Verifica se existe um usuário autenticado.
   */
  estaAutenticado(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * Observa mudanças de autenticação.
   *
   * Retorna uma função unsubscribe.
   */
  observarAuth(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Busca informações complementares
   * do usuário no Firestore.
   */
  async buscarUsuario(uid: string): Promise<Usuario | null> {
    const ref = doc(db, "usuarios", uid);

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as Usuario;
  }

  /**
   * Retorna o usuário autenticado juntamente
   * com os dados armazenados no Firestore.
   */
  async getPerfilAtual(): Promise<Usuario | null> {
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    return await this.buscarUsuario(user.uid);
  }
}

export const authService = new AuthService();
=======
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase/auth';
import { profileService } from './profileService';
import { validarEmail, validarSenha, textoObrigatorio, LIMITES } from '@/utils/validation';

export const authService = {
  async cadastrar(nomeInput: string, emailInput: string, senha: string) {
    const nome = textoObrigatorio(nomeInput, 'Nome', LIMITES.nome, 2);
    const email = validarEmail(emailInput);
    validarSenha(senha);
    const result = await createUserWithEmailAndPassword(auth, email, senha);
    await updateProfile(result.user, { displayName: nome });
    await profileService.salvar({ nome, fotoBase64: null, regiao: '' });
    return result.user;
  },
  login(email: string, senha: string) {
    if (!senha) throw new Error('Informe sua senha.');
    return signInWithEmailAndPassword(auth, validarEmail(email), senha);
  },
  recuperarSenha(email: string) {
    return sendPasswordResetEmail(auth, validarEmail(email));
  },
  logout() {
    return signOut(auth);
  },
};
>>>>>>> Stashed changes
