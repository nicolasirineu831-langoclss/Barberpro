# BarberPro — site de agendamento para barbearias

Site estático (HTML/CSS/JS) com backend no **Firebase** (Authentication + Firestore).
Hospedagem no **Render** (site estático, deploy automático a cada commit).

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Escolha de acesso (cliente ou dono) |
| `cliente.html` | Site público, agendamento e área do cliente |
| `admin.html` | Painel do dono |
| `shared.js` | Regras de horário, sanitização e utilitários compartilhados |
| `firebase-config.js` | Configuração do projeto Firebase |
| `firestore.rules` | **Regras de acesso ao banco** (a principal camada de segurança) |
| `firebase.json` | Aponta o Firebase CLI para as regras |
| `render.yaml` | Configuração do Render (cabeçalhos HTTP e cache) |
| `sw.js` | Service worker (cache só de arquivos estáticos) |

## 1. Configurar o Firebase (uma vez por barbearia)

1. No [Firebase Console](https://console.firebase.google.com), crie um projeto.
2. Em **Authentication → Sign-in method**, ative **E-mail/senha**.
3. Em **Firestore Database**, crie o banco (modo de produção).
4. Edite `firebase-config.js` com os dados do seu projeto (Configurações do projeto → Seus apps → Web).
   Essa configuração **não é segredo**: a proteção vem das regras, não da chave.
5. Publique as regras:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # escolha o projeto
   firebase deploy --only firestore:rules
   ```

### Criar o proprietário (dono)

O cadastro público de dono está desativado de propósito. Para criar o dono:

1. Crie a conta no Firebase Console em **Authentication → Users → Add user** (e-mail e senha).
2. Copie o **UID** dessa conta.
3. Em **Firestore → Start collection**, crie a coleção `admins` e um documento cujo **ID é o UID**, com os campos:
   - `name` (string), `email` (string), `bizName` (string), `phone` (string)
4. Entre em `admin.html` com esse e-mail e senha.

## 2. Publicar no Render

1. Envie este projeto para um repositório no GitHub (a raiz do repositório deve ser esta pasta).
2. No Render: **New → Static Site**, conecte o repositório e use:
   - **Build command:** vazio
   - **Publish directory:** `.`
   - Ou, mais simples: **New → Blueprint** e aponte para o `render.yaml`.
3. Cada `git push` na branch principal publica a nova versão automaticamente.

## 3. Personalizar para cada barbearia

Os dados da barbearia (nome, logo, cores, endereço, WhatsApp, Instagram, horários, serviços, profissionais e fotos) são editados pelo próprio painel do dono, em **Configurações** e **Site**. Nenhum dado de uma barbearia fica no código.

Para uma nova barbearia, use um **novo projeto Firebase** e um **novo serviço no Render** com este mesmo código. Assim os dados nunca se misturam.

## Segurança: o que está protegido e o que ainda não

**Protegido pelas regras (`firestore.rules`):**
- Só o dono (documento em `admins`) altera serviços, profissionais, galeria, configurações e horários.
- Cliente lê e cancela apenas os próprios agendamentos.
- Dois clientes não conseguem ocupar o mesmo horário: o espelho usa ID determinístico e só pode ser criado quando livre.
- Campos e tamanhos de agendamento são validados no servidor do Firebase.
- Nenhum visitante consegue se tornar dono.

**Ainda não coberto (pendências conhecidas):**
- **App Check** está desligado (`firebase-config.js`). Ative-o com reCAPTCHA Enterprise antes de divulgar o site, para bloquear robôs.
- **Scripts inline:** a CSP ainda usa `'unsafe-inline'`, porque o HTML tem muitos `onclick`. Remover isso exige mover o JavaScript para arquivos próprios.
- **Agendamentos antigos** (feitos antes desta versão, sem `clienteUid`) só podem ser cancelados pelo dono.
- **Reservas sem login** não podem ser canceladas pelo cliente. Quem quiser cancelar precisa entrar na conta ou falar com a barbearia.
- O espelho `disponibilidade` é público e contém o `clienteUid` (um identificador aleatório, sem dado pessoal). Nome, telefone e e-mail ficam só em `agendamentos`.

## Testes manuais antes de publicar

- [ ] Cadastro de cliente, login, recuperação de senha e edição de perfil.
- [ ] Agendamento logado e sem login; confirmação pelo WhatsApp.
- [ ] Tentar reservar um horário já ocupado (deve recusar).
- [ ] Cancelar um agendamento dentro da antecedência e fora dela.
- [ ] Login do dono; cadastro de dono pelo site deve estar indisponível.
- [ ] Como cliente, tentar abrir `admin.html` e editar serviços (deve falhar nas regras).
- [ ] Layout em celular, tablet e desktop.
