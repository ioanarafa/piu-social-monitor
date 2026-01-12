export const db = {
  voluntari: [
    { id: 1, nume: "Ana Pop" },
    { id: 2, nume: "Mihai Rusu" }
  ],

  interventii: [
    { id: 1, titlu: "Livrare alimente", beneficiar: "Pop Maria", status: "In curs", voluntar: "Ana Pop" },
    { id: 2, titlu: "Vizita medicala", beneficiar: "Ionescu Vasile", status: "Preluata", voluntar: "Mihai Rusu" }
  ],

  beneficiari: [
    { id: 1, nume: "Pop Maria", categorie: "Pensionar" },
    { id: 2, nume: "Ionescu Vasile", categorie: "Handicap" }
  ],

  livrari: [
    { id: 1, beneficiar: "Pop Maria", status: "Neconfirmata", voluntar: "Ana Pop" }
  ],

  urgente: [],
  alerte: [],
  vizite: [],
  evaluari: [],
  atribuiri: []
};
