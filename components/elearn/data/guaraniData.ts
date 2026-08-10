import { GuaraniWord } from '../types';

export const GUARANI_WORDS: GuaraniWord[] = [
  // SALUDOS
  { guarani: "Mba’éichapa", spanish: "¿Cómo estás? / Hola", category: "saludo" },
  { guarani: "Mba’éichapa nde pyhareve", spanish: "Buenos días (lit. ¿Cómo amaneciste?)", category: "saludo" },
  { guarani: "Ka’aru porã", spanish: "Buenas tardes", category: "saludo" },
  { guarani: "Pyhare porã", spanish: "Buenas noches", category: "saludo" },
  { guarani: "Iporã / Iporãite", spanish: "Bien / Muy bien", category: "saludo" },
  { guarani: "Aguyje", spanish: "Gracias", category: "saludo" },
  { guarani: "Aguyje ndéve", spanish: "Gracias a ti", category: "saludo" },
  { guarani: "Ndaipóri mba’e", spanish: "De nada", category: "saludo" },
  { guarani: "Jajotopa peve", spanish: "Hasta luego", category: "saludo" },

  // PRESENTACIÓN
  { guarani: "Che réra...", spanish: "Mi nombre es...", category: "presentacion" },
  { guarani: "Mba’éichapa nde réra?", spanish: "¿Cómo te llamas?", category: "presentacion" },
  { guarani: "Aiko Areguápe", spanish: "Vivo en Areguá", category: "presentacion" },
  { guarani: "Amba’apo Registro Civil-pe", spanish: "Trabajo en el Registro Civil", category: "presentacion" },
  { guarani: "Che paraguayo / paraguaya", spanish: "Soy paraguayo / paraguaya", category: "presentacion" },

  // NÚMEROS Y REGLA PO-TEĨ
  { guarani: "peteĩ", spanish: "1 (uno)", category: "numero", note: "Número básico" },
  { guarani: "mokõi", spanish: "2 (dos)", category: "numero", note: "Número básico" },
  { guarani: "mbohapy", spanish: "3 (tres)", category: "numero", note: "Número básico" },
  { guarani: "irundy", spanish: "4 (cuatro)", category: "numero", note: "Número básico" },
  { guarani: "po", spanish: "5 (cinco / mano)", category: "numero", note: "Base de la cuenta en mano" },
  { guarani: "poteĩ", spanish: "6 (seis)", category: "numero", note: "Formado por po (5) + peteĩ (1)" },
  { guarani: "pokõi", spanish: "7 (siete)", category: "numero", note: "Formado por po (5) + mokõi (2)" },
  { guarani: "poapy", spanish: "8 (ocho)", category: "numero", note: "Formado por po (5) + mbohapy (3)" },
  { guarani: "porundy", spanish: "9 (nueve)", category: "numero", note: "Formado por po (5) + irundy (4)" },
  { guarani: "pa", spanish: "10 (diez)", category: "numero", note: "Las dos manos juntas" },

  // DÍAS Y MESES
  { guarani: "arateĩ", spanish: "Domingo (día 1)", category: "dia", note: "Ára (día) + peteĩ (1)" },
  { guarani: "arakõi", spanish: "Lunes (día 2)", category: "dia", note: "Ára (día) + mokõi (2)" },
  { guarani: "araapy", spanish: "Martes (día 3)", category: "dia", note: "Ára (día) + mbohapy (3)" },
  { guarani: "jasyteĩ", spanish: "Enero (mes 1)", category: "mes", note: "Jasy (luna/mes) + peteĩ (1)" },
  { guarani: "jasykõi", spanish: "Febrero (mes 2)", category: "mes", note: "Jasy (luna/mes) + mokõi (2)" },
  { guarani: "jasypoteĩ", spanish: "Junio (mes 6)", category: "mes", note: "Jasy + poteĩ (6)" },

  // PALABRAS DEL TRABAJO Y DOCUMENTACIÓN
  { guarani: "kuatia", spanish: "Papel / documento", category: "trabajo" },
  { guarani: "kuatia’atã", spanish: "Documento de identidad / Cédula", category: "trabajo", note: "Lit. papel duro" },
  { guarani: "téra", spanish: "Nombre", category: "trabajo" },
  { guarani: "terajoapy", spanish: "Apellido", category: "trabajo" },
  { guarani: "tembiapoha", spanish: "Lugar de trabajo / Oficina", category: "trabajo" },
  { guarani: "tetã rembiapo", spanish: "Función pública / trabajo del Estado", category: "trabajo" },

  // FRASES DE VENTANILLA (ATENCIÓN AL CIUDADANO)
  { guarani: "Mba’éichapa, mba’épa ikatu ajapo nderehe?", spanish: "Buen día, ¿en qué puedo ayudarle?", category: "frase_ventanilla" },
  { guarani: "Eguahẽporãite", spanish: "Bienvenido/a", category: "frase_ventanilla" },
  { guarani: "Eguapy ko’ápe", spanish: "Siéntese aquí", category: "frase_ventanilla" },
  { guarani: "Eha’arõmi michĩmi", spanish: "Espere un momentito, por favor", category: "frase_ventanilla" },
  { guarani: "Emoĩmi ko’ápe nde réra", spanish: "Ponga aquí su nombre", category: "frase_ventanilla" },
  { guarani: "Ikatúpa ahecha nde kuatia’atã?", spanish: "¿Puedo ver su cédula/documento?", category: "frase_ventanilla" },
  { guarani: "Ehai ko’ápe nde téra ha nde terajoapy", spanish: "Escriba aquí su nombre y apellido", category: "frase_ventanilla" },
  { guarani: "Nde kuatia oĩta ko’ẽrõ", spanish: "Su documento estará listo mañana", category: "frase_ventanilla" },
  { guarani: "Aguyje reha’arõ haguére", spanish: "Muchas gracias por esperar", category: "frase_ventanilla" }
];

export const GUARANI_GRAMMAR_NOTES = [
  {
    title: "Ñande vs. Ore (Distinción Inclusivo/Exclusivo)",
    explanation: "Ñande significa 'nosotros' e INCLUYE al oyente (Tú y Yo). Ore significa 'nosotros' pero EXCLUYE al oyente (Ellos y Yo, pero tú no).",
    example: "Ñande paraguayo = Nosotros los paraguayos (dicho a otro paraguayo). Ore romba'apo ko'ápe = Nosotros trabajamos aquí (y tú no)."
  },
  {
    title: "Prefijos Verbales de 1ª Persona",
    explanation: "El verbo en guaraní usa prefijo según la persona: a- (yo), re- (tú/vos), o- (él/ella), ja-/ña- (nosotros inclusivo), ro- (nosotros exclusivo), pe- (ustedes).",
    example: "Ahai = yo escribo / Rehai = tú escribes / Ohai = él escribe."
  },
  {
    title: "Sufijo de Plural -kuéra",
    explanation: "Para formar el plural de sustantivos se agrega el sufijo -kuéra (o -nguéra tras sílaba nasal).",
    example: "Mitã = niño -> Mitãkuéra = los niños. Kuatia = documento -> Kuatiakuéra = los documentos."
  }
];
