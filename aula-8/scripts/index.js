const URL_API = "https://postman-echo.com/post";

const form = document.getElementById("form-cadastro");
const botaoEnviar = form.querySelector("button[type='submit']");

// ===============================
// Funções auxiliares
// ===============================
function somenteDigitos(texto) {
  return texto.replace(/\D/g, "");
}

// ===============================
// Máscaras
// ===============================
function mascaraCpf(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function mascaraTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);

  if (d.length <= 2) {
    return d.length ? "(" + d : "";
  }
  if (d.length <= 6) {
    return "(" + d.slice(0, 2) + ") " + d.slice(2);
  }
  if (d.length <= 10) {
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  }
  return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
}

function mascaraCep(valor) {
  const d = somenteDigitos(valor).slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
}

function aplicarMascara(idCampo, funcaoMascara) {
  const campo = document.getElementById(idCampo);
  campo.addEventListener("input", function () {
    campo.value = funcaoMascara(campo.value);
  });
}

aplicarMascara("cpf", mascaraCpf);
aplicarMascara("telefone", mascaraTelefone);
aplicarMascara("cep", mascaraCep);
aplicarMascara("numero", function (v) {
  return somenteDigitos(v).slice(0, 6);
});

// ===============================
// Validações (retornam "" se válido ou a mensagem de erro)
// ===============================
function cpfValido(cpf) {
  const d = somenteDigitos(cpf);

  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) {
    return false;
  }

  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) {
      soma += parseInt(d[i], 10) * (t + 1 - i);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== parseInt(d[t], 10)) {
      return false;
    }
  }
  return true;
}

const validadores = {
  nome: function (v) {
    const partes = v.trim().split(/\s+/);
    if (v.trim() === "") return "Informe o nome completo.";
    if (partes.length < 2 || partes.some(function (p) { return p.length < 2; })) {
      return "Digite nome e sobrenome.";
    }
    return "";
  },

  email: function (v) {
    if (v.trim() === "") return "Informe o e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "E-mail inválido.";
    return "";
  },

  cpf: function (v) {
    if (v.trim() === "") return "Informe o CPF.";
    if (!cpfValido(v)) return "CPF inválido.";
    return "";
  },

  nascimento: function (v) {
    if (v === "") return "Informe a data de nascimento.";
    const data = new Date(v + "T00:00:00");
    const hoje = new Date();
    if (data > hoje) return "A data não pode ser futura.";
    if (data.getFullYear() < 1900) return "Data inválida.";
    return "";
  },

  telefone: function (v) {
    const d = somenteDigitos(v);
    if (d === "") return "Informe o telefone.";
    if (d.length < 10) return "Telefone incompleto.";
    if (d.length === 11 && d[2] !== "9") return "Celular deve começar com 9 após o DDD.";
    return "";
  },

  cep: function (v) {
    if (somenteDigitos(v).length === 0) return "Informe o CEP.";
    if (somenteDigitos(v).length !== 8) return "CEP deve ter 8 dígitos.";
    return "";
  },

  endereco: function (v) {
    if (v.trim() === "") return "Informe o endereço.";
    if (v.trim().length < 5) return "Endereço muito curto.";
    return "";
  },

  numero: function (v) {
    if (v.trim() === "") return "Informe o número.";
    return "";
  },

  cidade: function (v) {
    if (v.trim() === "") return "Informe a cidade.";
    if (v.trim().length < 2) return "Cidade inválida.";
    return "";
  },

  estado: function (v) {
    if (v === "") return "Selecione o estado.";
    return "";
  },

  senha: function (v) {
    if (v === "") return "Informe a senha.";
    if (v.length < 8) return "A senha deve ter ao menos 8 caracteres.";
    if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return "Use letras e números.";
    return "";
  },

  confirmarSenha: function (v) {
    if (v === "") return "Confirme a senha.";
    if (v !== form.elements["senha"].value) return "As senhas não coincidem.";
    return "";
  },

  termos: function (_valor, campo) {
    if (!campo.checked) return "É necessário aceitar os termos.";
    return "";
  }
};

// ===============================
// Exibição dos erros
// ===============================
function validarCampo(nome) {
  const campo = form.elements[nome];
  const mensagem = validadores[nome](campo.value, campo);
  const caixa = campo.closest(".campo");
  const textoErro = form.querySelector("[data-erro='" + nome + "']");

  textoErro.textContent = mensagem;
  caixa.classList.toggle("invalido", mensagem !== "");
  caixa.classList.toggle("valido", mensagem === "");

  return mensagem === "";
}

function validarFormulario() {
  let primeiroInvalido = null;

  Object.keys(validadores).forEach(function (nome) {
    const ok = validarCampo(nome);
    if (!ok && primeiroInvalido === null) {
      primeiroInvalido = form.elements[nome];
    }
  });

  if (primeiroInvalido) {
    primeiroInvalido.focus();
    return false;
  }
  return true;
}

// revalida cada campo quando o usuário sai dele
Object.keys(validadores).forEach(function (nome) {
  const campo = form.elements[nome];
  const evento = campo.type === "checkbox" || campo.tagName === "SELECT" ? "change" : "blur";
  campo.addEventListener(evento, function () {
    validarCampo(nome);
  });
});

// ao limpar, remove também as marcações de erro
form.addEventListener("reset", function () {
  form.querySelectorAll(".campo").forEach(function (c) {
    c.classList.remove("valido", "invalido");
  });
  form.querySelectorAll(".erro").forEach(function (e) {
    e.textContent = "";
  });
});

// ===============================
// Envio
// ===============================
form.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  if (!validarFormulario()) {
    return;
  }

  // As senhas ficam de fora: a API é pública e devolve tudo que recebe.
  const dados = {
    nome: form.elements["nome"].value.trim(),
    email: form.elements["email"].value.trim(),
    cpf: form.elements["cpf"].value,
    nascimento: form.elements["nascimento"].value,
    telefone: form.elements["telefone"].value,
    cep: form.elements["cep"].value,
    endereco: form.elements["endereco"].value.trim(),
    numero: form.elements["numero"].value,
    cidade: form.elements["cidade"].value.trim(),
    estado: form.elements["estado"].value,
    termos: form.elements["termos"].checked
  };

  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Enviando...";

  try {
    const resposta = await fetch(URL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      throw new Error("Erro HTTP " + resposta.status);
    }

    const retorno = await resposta.json();
    alert("Cadastro enviado com sucesso!\n\nRetorno da API:\n" + JSON.stringify(retorno, null, 2));
  } catch (erro) {
    alert("Não foi possível enviar o cadastro.\n" + erro.message);
  } finally {
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = "Cadastrar";
  }
});